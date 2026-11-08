package in.schoolos.desktop

import in.schoolos.desktop.model.FeeHeadItem
import in.schoolos.desktop.model.OfflineReceiptTransaction
import in.schoolos.desktop.model.PaymentMode
import in.schoolos.desktop.model.StudentFeeDues
import in.schoolos.desktop.model.SyncStatus
import in.schoolos.desktop.printer.EscPosPrinter
import in.schoolos.desktop.storage.LocalDatabase
import java.io.File
import java.math.BigDecimal
import java.util.UUID
import kotlin.test.*

class DesktopOfflineSyncTest {

    private val testDbFile = "test_schoolos_offline.db"
    private lateinit var db: LocalDatabase

    @BeforeTest
    fun setup() {
        File(testDbFile).delete()
        db = LocalDatabase(testDbFile)
    }

    @AfterTest
    fun tearDown() {
        File(testDbFile).delete()
    }

    @Test
    fun testOfflineReceiptQueueAndSyncState() {
        assertEquals(0, db.countPending())

        val txId = UUID.randomUUID().toString()
        val tx = OfflineReceiptTransaction(
            clientTxId = txId,
            invoiceId = "inv-001",
            studentId = "std-001",
            studentName = "Aarav Sharma",
            admissionNo = "DPS-2024-042",
            className = "Class 5-A",
            amount = BigDecimal("3875.00"),
            paymentMode = PaymentMode.CASH
        )

        // 1. Queue receipt while internet is down
        db.queueOfflineReceipt(tx)
        assertEquals(1, db.countPending())

        val pendingList = db.getPendingReceipts()
        assertEquals(1, pendingList.size)
        assertEquals(txId, pendingList[0].clientTxId)
        assertEquals(BigDecimal("3875.00"), pendingList[0].amount)
        assertEquals(SyncStatus.PENDING, pendingList[0].status)

        // 2. Mark synced when internet recovers and server acknowledges
        db.markReceiptSynced(txId, "RCP-2026-098234")
        assertEquals(0, db.countPending())
    }

    @Test
    fun testEscPosReceiptStreamGeneration() {
        val printer = EscPosPrinter()
        val dues = StudentFeeDues(
            studentId = "std-001",
            admissionNo = "DPS-2024-042",
            name = "Aarav Sharma",
            className = "Class 5",
            section = "A",
            rollNo = "14",
            guardianName = "Rajesh Sharma",
            guardianPhone = "9876543210",
            siblingName = "Ananya Sharma",
            siblingClass = "Class 2-B",
            invoiceId = "inv-001",
            invoiceNumber = "INV-2026-0042",
            billingPeriod = "NOVEMBER 2026",
            items = listOf(
                FeeHeadItem("head-1", "Tuition Fee", BigDecimal("2500.00"), BigDecimal("625.00"), BigDecimal("1875.00")),
                FeeHeadItem("head-2", "Transport Fee", BigDecimal("1000.00"), BigDecimal.ZERO, BigDecimal("1000.00"))
            ),
            grossTotal = BigDecimal("3500.00"),
            totalConcession = BigDecimal("625.00"),
            netPayable = BigDecimal("2875.00")
        )

        val bytes = printer.buildReceiptStream(
            dues = dues,
            receiptNo = "RCP-2026-098234",
            amountReceived = BigDecimal("3000.00"),
            changeDue = BigDecimal("125.00"),
            isOfflineProvisional = true
        )

        assertTrue(bytes.isNotEmpty())
        val outputString = String(bytes, Charsets.US_ASCII)

        // Verify key receipt text invariants
        assertTrue(outputString.contains("DELHI PUBLIC SCHOOL"))
        assertTrue(outputString.contains("RCP-2026-098234"))
        assertTrue(outputString.contains("Aarav Sharma"))
        assertTrue(outputString.contains("Tuition Fee"))
        assertTrue(outputString.contains("PROVISIONAL OFFLINE RECEIPT"))

        // Verify standard ESC/POS command sequences:
        // Starts with ESC @ (0x1B, 0x40)
        assertEquals(0x1B.toByte(), bytes[0])
        assertEquals(0x40.toByte(), bytes[1])

        // Ends with GS V 1 (0x1D, 0x56, 0x01) Paper Cut
        val lastCutIdx = bytes.size - 3
        assertEquals(0x1D.toByte(), bytes[lastCutIdx])
        assertEquals(0x56.toByte(), bytes[lastCutIdx + 1])
        assertEquals(0x01.toByte(), bytes[lastCutIdx + 2])
    }
}
