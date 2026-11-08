package in.schoolos.desktop.sync

import in.schoolos.desktop.model.OfflineReceiptTransaction
import in.schoolos.desktop.storage.LocalDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class OfflineSyncWorker(
    private val localDb: LocalDatabase,
    private val apiBaseUrl: String = "http://localhost:8080/v1"
) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(3, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    fun startSyncLoop(scope: CoroutineScope, onSyncCompleted: (Int) -> Unit = {}) {
        scope.launch(Dispatchers.IO) {
            while (isActive) {
                try {
                    val pending = localDb.getPendingReceipts()
                    if (pending.isNotEmpty()) {
                        val syncedCount = syncBatch(pending)
                        if (syncedCount > 0) {
                            onSyncCompleted(syncedCount)
                        }
                    }
                } catch (e: Exception) {
                    // Backoff silently on network dropout; local-first desktop continues without crashing
                }
                delay(10_000) // Poll every 10 seconds
            }
        }
    }

    suspend fun syncBatch(pendingList: List<OfflineReceiptTransaction>): Int {
        if (pendingList.isEmpty()) return 0

        val batchObj = JSONObject()
        batchObj.put("device_id", "POS-COUNTER-01")
        batchObj.put("batch_id", "batch-${System.currentTimeMillis()}")

        val txArray = JSONArray()
        for (tx in pendingList) {
            val item = JSONObject()
            item.put("client_tx_id", tx.clientTxId)
            item.put("invoice_id", tx.invoiceId)
            item.put("student_id", tx.studentId)
            item.put("amount", tx.amount.toDouble())
            item.put("payment_mode", tx.paymentMode.name)
            item.put("collected_at", tx.collectedAt)
            txArray.put(item)
        }
        batchObj.put("transactions", txArray)

        val req = Request.Builder()
            .url("$apiBaseUrl/sync/offline-receipts")
            .post(batchObj.toString().toRequestBody(jsonMedia))
            .build()

        client.newCall(req).execute().use { resp ->
            if (resp.isSuccessful) {
                val respBody = resp.body?.string() ?: return 0
                val root = JSONObject(respBody)
                val results = root.getJSONArray("results")
                for (i in 0 until results.length()) {
                    val r = results.getJSONObject(i)
                    val clientTxId = r.getString("client_tx_id")
                    val serverRcp = r.getString("server_receipt_number")
                    localDb.markReceiptSynced(clientTxId, serverRcp)
                }
                return results.length()
            }
        }
        return 0
    }
}
