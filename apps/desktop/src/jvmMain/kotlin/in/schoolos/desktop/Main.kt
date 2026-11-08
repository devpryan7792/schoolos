package in.schoolos.desktop

import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application
import in.schoolos.desktop.storage.LocalDatabase
import in.schoolos.desktop.sync.OfflineSyncWorker
import in.schoolos.desktop.ui.CashCounterScreen
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

fun main() = application {
    val localDb = LocalDatabase("schoolos_counter_offline.db")
    val syncScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    val syncWorker = OfflineSyncWorker(localDb)
    syncWorker.startSyncLoop(syncScope)

    Window(
        onCloseRequest = ::exitApplication,
        title = "SchoolOS Cash Counter POS • Offline-First Native Desktop",
        state = WindowState(width = 1200.dp, height = 780.dp)
    ) {
        CashCounterScreen(localDb)
    }
}
