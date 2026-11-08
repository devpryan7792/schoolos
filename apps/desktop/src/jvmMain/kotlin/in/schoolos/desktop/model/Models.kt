package in.schoolos.desktop.model

import java.math.BigDecimal
import java.time.Instant

enum class SyncStatus {
    PENDING,
    SYNCED,
    FAILED
}

enum class PaymentMode {
    CASH,
    UPI,
    POS_CARD,
    DEMAND_DRAFT
}

data class FeeHeadItem(
    val headId: String,
    val name: String,
    val standardAmount: BigDecimal,
    val concessionDeduction: BigDecimal,
    val netAmount: BigDecimal,
    val isSelected: Boolean = true
)

data class StudentFeeDues(
    val studentId: String,
    val admissionNo: String,
    val name: String,
    val className: String,
    val section: String,
    val rollNo: String,
    val guardianName: String,
    val guardianPhone: String,
    val siblingName: String? = null,
    val siblingClass: String? = null,
    val invoiceId: String,
    val invoiceNumber: String,
    val billingPeriod: String,
    val items: List<FeeHeadItem>,
    val grossTotal: BigDecimal,
    val totalConcession: BigDecimal,
    val netPayable: BigDecimal
)

data class OfflineReceiptTransaction(
    val clientTxId: String,
    val invoiceId: String,
    val studentId: String,
    val studentName: String,
    val admissionNo: String,
    val className: String,
    val amount: BigDecimal,
    val paymentMode: PaymentMode,
    val collectedAt: String = Instant.now().toString(),
    val status: SyncStatus = SyncStatus.PENDING,
    val serverReceiptNo: String? = null
)
