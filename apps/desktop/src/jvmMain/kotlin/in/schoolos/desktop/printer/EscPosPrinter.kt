package in.schoolos.desktop.printer

import in.schoolos.desktop.model.StudentFeeDues
import java.io.ByteArrayOutputStream
import java.math.BigDecimal
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class EscPosPrinter {
    companion object {
        val ESC: Byte = 0x1B
        val GS: Byte = 0x1D

        val CMD_INIT = byteArrayOf(ESC, 0x40)
        val CMD_ALIGN_CENTER = byteArrayOf(ESC, 0x61, 0x01)
        val CMD_ALIGN_LEFT = byteArrayOf(ESC, 0x61, 0x00)
        val CMD_ALIGN_RIGHT = byteArrayOf(ESC, 0x61, 0x02)
        val CMD_BOLD_ON = byteArrayOf(ESC, 0x45, 0x01)
        val CMD_BOLD_OFF = byteArrayOf(ESC, 0x45, 0x00)
        val CMD_DOUBLE_SIZE = byteArrayOf(GS, 0x21, 0x11)
        val CMD_NORMAL_SIZE = byteArrayOf(GS, 0x21, 0x00)
        val CMD_PAPER_CUT = byteArrayOf(GS, 0x56, 0x01)
    }

    /**
     * Builds raw ESC/POS byte array for standard 80mm thermal receipt.
     */
    fun buildReceiptStream(
        dues: StudentFeeDues,
        receiptNo: String,
        amountReceived: BigDecimal,
        changeDue: BigDecimal,
        isOfflineProvisional: Boolean = false
    ): ByteArray {
        val stream = ByteArrayOutputStream()

        fun write(bytes: ByteArray) = stream.write(bytes)
        fun writeText(text: String) = stream.write(text.toByteArray(Charsets.US_ASCII))
        fun line(text: String = "") {
            writeText(text)
            writeText("\n")
        }

        // 1. Initialize
        write(CMD_INIT)

        // 2. Center Align School Header
        write(CMD_ALIGN_CENTER)
        write(CMD_BOLD_ON)
        write(CMD_DOUBLE_SIZE)
        line("DELHI PUBLIC SCHOOL")
        write(CMD_NORMAL_SIZE)
        line("RANCHI, JHARKHAND")
        line("Affiliation No: 3430042 • School Code: 08124")
        write(CMD_BOLD_OFF)
        line("------------------------------------------------")

        // 3. Receipt Metadata (Left Aligned)
        write(CMD_ALIGN_LEFT)
        line("Receipt No : $receiptNo")
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a"))
        line("Date & Time: $timestamp")
        line("Student    : ${dues.name} (${dues.className}-${dues.section})")
        line("Admission  : ${dues.admissionNo} • Roll: ${dues.rollNo}")
        line("Guardian   : ${dues.guardianName} (${dues.guardianPhone})")
        if (dues.siblingName != null) {
            line("Sibling    : ${dues.siblingName} [25% Sibling Disc Applied]")
        }
        line("Billing    : ${dues.billingPeriod}")
        line("------------------------------------------------")

        // 4. Itemized Dues Table (48 Columns)
        line(String.format("%-28s %19s", "FEE PARTICULARS", "AMOUNT (INR)"))
        line("------------------------------------------------")
        for (item in dues.items.filter { it.isSelected }) {
            val netStr = String.format("%,.2f", item.netAmount)
            line(String.format("%-28s %19s", item.name, netStr))
            if (item.concessionDeduction > BigDecimal.ZERO) {
                val discStr = String.format("-%,.2f", item.concessionDeduction)
                line(String.format("  (-) Concession Deduction %23s", discStr))
            }
        }
        line("------------------------------------------------")

        // 5. Totals & Tender
        write(CMD_BOLD_ON)
        val netStr = String.format("INR %,.2f", dues.netPayable)
        line(String.format("%-24s %23s", "NET PAYABLE:", netStr))
        val recStr = String.format("INR %,.2f (CASH)", amountReceived)
        line(String.format("%-24s %23s", "AMOUNT TENDERED:", recStr))
        if (changeDue > BigDecimal.ZERO) {
            val changeStr = String.format("INR %,.2f", changeDue)
            line(String.format("%-24s %23s", "CHANGE RETURNED:", changeStr))
        }
        write(CMD_BOLD_OFF)
        line("------------------------------------------------")

        // 6. QR Verification Link & Status
        write(CMD_ALIGN_CENTER)
        if (isOfflineProvisional) {
            write(CMD_BOLD_ON)
            line("*** PROVISIONAL OFFLINE RECEIPT ***")
            line("Recorded in local SQLite cache.")
            write(CMD_BOLD_OFF)
        }
        line("Verification: verify.schoolos.in/receipts/$receiptNo")
        line("Computer Generated Counter Receipt • Thank you!")
        line("\n\n")

        // 7. Partial Paper Cut
        write(CMD_PAPER_CUT)

        return stream.toByteArray()
    }
}
