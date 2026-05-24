import os
import re
import requests

BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:4000")

ACCOUNT_TYPES = [
    "ACCOUNTS_PAYABLE", "ACCOUNTS_RECEIVABLE", "BANK", "CREDIT_CARD",
    "FIXED_ASSET", "LIABILITY", "EQUITY", "EXPENSE", "REVENUE", "OTHER",
]

# Rules engine: ordered from most specific to least specific
RULES = {
    "ACCOUNTS_RECEIVABLE": [
        "accounts receivable", "a/r", "ar ", "invoice sent", "client invoice",
        "payment expected", "billed to", "customer balance",
    ],
    "ACCOUNTS_PAYABLE": [
        "accounts payable", "a/p", "ap ", "vendor payment", "supplier payment",
        "payable", "bill payment", "purchase order",
    ],
    "REVENUE": [
        "sales receipt", "payment received", "client payment", "customer payment",
        "invoice paid", "revenue", "income", "deposit - client", "service income",
        "consulting fee received",
    ],
    "EXPENSE": [
        "payroll", "salary", "salaries", "wages", "direct deposit",
        "utilities", "hydro", "electricity", "gas bill", "water bill",
        "rent", "lease payment", "office rent",
        "insurance premium", "insurance payment",
        "subscription", "saas", "software license",
        "office supplies", "supplies purchase",
        "travel expense", "airfare", "hotel", "uber", "parking",
        "meals", "restaurant", "catering",
        "advertising", "marketing", "google ads", "facebook ads",
        "professional fees", "legal fee", "accounting fee",
        "telephone", "internet", "phone bill",
    ],
    "CREDIT_CARD": [
        "credit card payment", "visa payment", "mastercard payment",
        "amex payment", "american express", "cc payment",
    ],
    "BANK": [
        "interbank transfer", "wire transfer", "eft transfer",
        "bank transfer", "chequing", "savings transfer",
        "internal transfer", "interac",
    ],
    "LIABILITY": [
        "loan payment", "loan repayment", "mortgage payment",
        "line of credit", "loc payment", "debt payment",
        "term loan", "business loan",
    ],
    "EQUITY": [
        "shareholder", "owner contribution", "capital injection",
        "equity investment", "dividend payment", "owner draw",
        "retained earnings",
    ],
    "FIXED_ASSET": [
        "equipment purchase", "machinery", "vehicle purchase",
        "computer purchase", "furniture", "leasehold improvement",
        "capital expenditure", "capex",
    ],
}

HIGH_CONFIDENCE_THRESHOLD = 0.85


def _rules_engine(memo: str):
    if not memo:
        return "OTHER", 0.0

    memo_lower = memo.lower()

    for account_type, keywords in RULES.items():
        for kw in keywords:
            if kw in memo_lower:
                # Longer keyword = higher confidence (more specific match)
                conf = min(0.95, 0.70 + len(kw) * 0.015)
                return account_type, conf

    return "OTHER", 0.2


def _llm_classify(memo: str, amount: float, api_key: str):
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        types_list = "\n".join(f"- {t}" for t in ACCOUNT_TYPES)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=20,
            messages=[{
                "role": "user",
                "content": (
                    f"Classify this business transaction into exactly one account type.\n\n"
                    f"Memo: \"{memo}\"\nAmount: {amount}\n\n"
                    f"Account types:\n{types_list}\n\n"
                    "Respond with ONLY the account type name."
                ),
            }],
        )
        result = message.content[0].text.strip().upper()
        if result in ACCOUNT_TYPES:
            return result, 0.78
        return "OTHER", 0.3
    except Exception as e:
        print(f"SmartPrint LLM error: {e}")
        return None, 0.0


def smartprint(transactions: list, user: str) -> list:
    """
    Classify transactions with empty category arrays.

    High-confidence results are injected directly so the analysis pipeline
    can use them. Low-confidence items are saved as pending HITL reviews.
    Returns the enriched transaction list.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    pending_hitl = []
    enriched = []

    for tx in transactions:
        categories = tx.get("category") or []
        if categories:
            enriched.append(tx)
            continue

        memo = tx.get("memo") or ""
        amount = float(tx.get("total_amount") or 0)
        tx_id = str(tx.get("transaction_id") or tx.get("_id") or "")
        date = str(tx.get("created_at") or "")

        account_type, confidence = _rules_engine(memo)
        source = "rules"

        if confidence < HIGH_CONFIDENCE_THRESHOLD and api_key:
            llm_type, llm_conf = _llm_classify(memo, amount, api_key)
            if llm_type and llm_conf > confidence:
                account_type = llm_type
                confidence = llm_conf
                source = "llm"

        enriched.append({
            **tx,
            "category": [{
                "type": None,
                "account_type": account_type,
                "account_name": account_type.replace("_", " ").title(),
                "total_amount": amount,
                "total_amount_real": amount,
            }],
        })

        if confidence < HIGH_CONFIDENCE_THRESHOLD:
            pending_hitl.append({
                "transactionId": tx_id,
                "memo": memo,
                "amount": amount,
                "date": date,
                "proposedAccountType": account_type,
                "confidence": round(confidence, 3),
                "source": source,
            })

    if pending_hitl:
        try:
            requests.post(
                f"{BASE_URL}/saveClassifications",
                json={"userId": user, "classifications": pending_hitl},
                timeout=10,
            )
        except Exception as e:
            print(f"SmartPrint: failed to save HITL items: {e}")

    classified = len([t for t in transactions if not (t.get("category") or [])])
    if classified:
        print(f"SmartPrint: classified {classified} transactions ({len(pending_hitl)} pending HITL)")

    return enriched
