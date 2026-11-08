package in.schoolos.desktop.storage

import in.schoolos.desktop.model.OfflineReceiptTransaction
import in.schoolos.desktop.model.PaymentMode
import in.schoolos.desktop.model.SyncStatus
import java.io.File
import java.math.BigDecimal
import java.sql.Connection
import java.sql.DriverManager
import java.util.UUID

class LocalDatabase(dbFilePath: String = "schoolos_counter_offline.db") {
    private val dbUrl = "jdbc:sqlite:$dbFilePath"

    init {
        initSchema()
    }

    private fun getConnection(): Connection {
        return DriverManager.getConnection(dbUrl)
    }

    private fun initSchema() {
        getConnection().use { conn ->
            conn.createStatement().use { stmt ->
                // Offline Receipts Queue table (SPECIFICATION.md Section 4)
                stmt.execute(
                    """
                    CREATE TABLE IF NOT EXISTS offline_receipt_queue (
                        client_tx_id TEXT PRIMARY KEY,
                        invoice_id TEXT NOT NULL,
                        student_id TEXT NOT NULL,
                        student_name TEXT NOT NULL,
                        admission_no TEXT NOT NULL,
                        class_name TEXT NOT NULL,
                        amount TEXT NOT NULL,
                        payment_mode TEXT NOT NULL,
                        collected_at TEXT NOT NULL,
                        status TEXT NOT NULL DEFAULT 'PENDING',
                        server_receipt_no TEXT
                    );
                    """.trimIndent()
                )

                // Cached student balance table for instant offline lookup
                stmt.execute(
                    """
                    CREATE TABLE IF NOT EXISTS cached_student_balances (
                        admission_no TEXT PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        student_name TEXT NOT NULL,
                        class_name TEXT NOT NULL,
                        guardian_phone TEXT NOT NULL,
                        outstanding_balance TEXT NOT NULL,
                        last_cached_at TEXT NOT NULL
                    );
                    """.trimIndent()
                )
            }
        }
    }

    fun queueOfflineReceipt(tx: OfflineReceiptTransaction) {
        val sql = """
            INSERT INTO offline_receipt_queue 
            (client_tx_id, invoice_id, student_id, student_name, admission_no, class_name, amount, payment_mode, collected_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """.trimIndent()

        getConnection().use { conn ->
            conn.prepareStatement(sql).use { pstmt ->
                pstmt.setString(1, tx.clientTxId)
                pstmt.setString(2, tx.invoiceId)
                pstmt.setString(3, tx.studentId)
                pstmt.setString(4, tx.studentName)
                pstmt.setString(5, tx.admissionNo)
                pstmt.setString(6, tx.className)
                pstmt.setString(7, tx.amount.toPlainString())
                pstmt.setString(8, tx.paymentMode.name)
                pstmt.setString(9, tx.collectedAt)
                pstmt.setString(10, tx.status.name)
                pstmt.executeUpdate()
            }
        }
    }

    fun getPendingReceipts(): List<OfflineReceiptTransaction> {
        val list = mutableListOf<OfflineReceiptTransaction>()
        val sql = "SELECT * FROM offline_receipt_queue WHERE status = 'PENDING' ORDER BY collected_at ASC;"

        getConnection().use { conn ->
            conn.createStatement().use { stmt ->
                val rs = stmt.executeQuery(sql)
                while (rs.next()) {
                    list.add(
                        OfflineReceiptTransaction(
                            clientTxId = rs.getString("client_tx_id"),
                            invoiceId = rs.getString("invoice_id"),
                            studentId = rs.getString("student_id"),
                            studentName = rs.getString("student_name"),
                            admissionNo = rs.getString("admission_no"),
                            className = rs.getString("class_name"),
                            amount = BigDecimal(rs.getString("amount")),
                            paymentMode = PaymentMode.valueOf(rs.getString("payment_mode")),
                            collectedAt = rs.getString("collected_at"),
                            status = SyncStatus.valueOf(rs.getString("status")),
                            serverReceiptNo = rs.getString("server_receipt_no")
                        )
                    )
                }
            }
        }
        return list
    }

    fun markReceiptSynced(clientTxId: String, serverReceiptNo: String) {
        val sql = "UPDATE offline_receipt_queue SET status = 'SYNCED', server_receipt_no = ? WHERE client_tx_id = ?;"
        getConnection().use { conn ->
            conn.prepareStatement(sql).use { pstmt ->
                pstmt.setString(1, serverReceiptNo)
                pstmt.setString(2, clientTxId)
                pstmt.executeUpdate()
            }
        }
    }

    fun countPending(): Int {
        val sql = "SELECT COUNT(*) FROM offline_receipt_queue WHERE status = 'PENDING';"
        getConnection().use { conn ->
            conn.createStatement().use { stmt ->
                val rs = stmt.executeQuery(sql)
                return if (rs.next()) rs.getInt(1) else 0
            }
        }
    }
}
