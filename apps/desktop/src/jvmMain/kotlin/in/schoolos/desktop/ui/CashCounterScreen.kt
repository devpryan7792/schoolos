package in.schoolos.desktop.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import in.schoolos.desktop.model.*
import in.schoolos.desktop.printer.EscPosPrinter
import in.schoolos.desktop.storage.LocalDatabase
import java.math.BigDecimal
import java.util.UUID

@Composable
fun CashCounterScreen(localDb: LocalDatabase) {
    var searchAdmNo by remember { mutableStateOf("DPS-2024-042") }
    var paymentMode by remember { mutableStateOf(PaymentMode.CASH) }
    var amountTenderedStr by remember { mutableStateOf("4000.00") }
    var isOnline by remember { mutableStateOf(true) }
    var pendingCount by remember { mutableStateOf(localDb.countPending()) }
    var lastReceiptNo by remember { mutableStateOf("RCP-2026-098234") }
    var showSuccessBanner by remember { mutableStateOf(false) }

    // Mock initial student fee dues (Aarav Sharma)
    val feeItems = remember {
        mutableStateListOf(
            FeeHeadItem("head-1", "Tuition Fee (November)", BigDecimal("2500.00"), BigDecimal("625.00"), BigDecimal("1875.00")),
            FeeHeadItem("head-2", "Transport Fee (Zone 2: Hinoo)", BigDecimal("1000.00"), BigDecimal.ZERO, BigDecimal("1000.00")),
            FeeHeadItem("head-3", "Science Laboratory Fee", BigDecimal("1000.00"), BigDecimal.ZERO, BigDecimal("1000.00")),
            FeeHeadItem("head-4", "Annual Sports Assessment (Dec)", BigDecimal("500.00"), BigDecimal.ZERO, BigDecimal("500.00"), isSelected = false)
        )
    }

    val selectedItems = feeItems.filter { it.isSelected }
    val netPayable = selectedItems.fold(BigDecimal.ZERO) { acc, item -> acc.add(item.netAmount) }
    val grossTotal = selectedItems.fold(BigDecimal.ZERO) { acc, item -> acc.add(item.standardAmount) }
    val totalConcession = selectedItems.fold(BigDecimal.ZERO) { acc, item -> acc.add(item.concessionDeduction) }

    val tendered = try { BigDecimal(amountTenderedStr) } catch (e: Exception) { BigDecimal.ZERO }
    val changeDue = if (tendered > netPayable) tendered.subtract(netPayable) else BigDecimal.ZERO

    val currentDues = StudentFeeDues(
        studentId = "d1a80101-92b5-4b11-9ef0-0a1234567891",
        admissionNo = searchAdmNo,
        name = "Aarav Sharma",
        className = "Class 5",
        section = "A",
        rollNo = "14",
        guardianName = "Rajesh Sharma",
        guardianPhone = "9876543210",
        siblingName = "Ananya Sharma (Class 2-B)",
        siblingClass = "Class 2-B",
        invoiceId = "e0a80101-92b5-4b11-9ef0-0a1234567893",
        invoiceNumber = "INV-2026-0042",
        billingPeriod = "NOVEMBER 2026",
        items = feeItems,
        grossTotal = grossTotal,
        totalConcession = totalConcession,
        netPayable = netPayable
    )

    fun handleCollectAndPrint() {
        val clientTxId = UUID.randomUUID().toString()
        val generatedRcp = "RCP-${System.currentTimeMillis() % 1000000}"
        lastReceiptNo = generatedRcp

        // 1. Queue to SQLite local storage (Offline-First Durability)
        val tx = OfflineReceiptTransaction(
            clientTxId = clientTxId,
            invoiceId = currentDues.invoiceId,
            studentId = currentDues.studentId,
            studentName = currentDues.name,
            admissionNo = currentDues.admissionNo,
            className = "${currentDues.className}-${currentDues.section}",
            amount = netPayable,
            paymentMode = paymentMode
        )
        localDb.queueOfflineReceipt(tx)
        pendingCount = localDb.countPending()

        // 2. Generate ESC/POS byte stream
        val printer = EscPosPrinter()
        val bytes = printer.buildReceiptStream(currentDues, generatedRcp, tendered, changeDue, isOfflineProvisional = !isOnline)

        showSuccessBanner = true
    }

    Column(modifier = Modifier.fillMaxSize().background(Color(0xFFF8FAFC))) {
        // Top POS Action Bar
        Surface(
            color = Color.White,
            shadowElevation = 2.dp,
            modifier = Modifier.fillMaxWidth().height(56.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("SchoolOS Cash Counter POS", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1E3A8A))
                    Surface(
                        color = Color(0xFFEFF6FF),
                        shape = RoundedCornerShape(4.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBFDBFE))
                    ) {
                        Text("Terminal: POS-01 (Reception)", fontSize = 11.sp, color = Color(0xFF1D4ED8), modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    // Connectivity Pill
                    Surface(
                        color = if (isOnline) Color(0xFFECFDF5) else Color(0xFFFFFBEB),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, if (isOnline) Color(0xFFA7F3D0) else Color(0xFFFDE68A))
                    ) {
                        Row(modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(modifier = Modifier.size(8.dp).background(if (isOnline) Color(0xFF10B981) else Color(0xFFF59E0B), shape = RoundedCornerShape(4.dp)))
                            Spacer(Modifier.width(6.dp))
                            Text(
                                if (isOnline) "ONLINE" else "OFFLINE QUEUE ($pendingCount)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isOnline) Color(0xFF065F46) else Color(0xFF92400E)
                            )
                        }
                    }

                    Button(
                        onClick = { isOnline = !isOnline },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF1F5F9)),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(if (isOnline) "Simulate Internet Drop" else "Reconnect Cloud", fontSize = 11.sp, color = Color(0xFF475569))
                    }
                }
            }
        }

        // Split-Pane Layout
        Row(modifier = Modifier.fillMaxSize().padding(16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            // Left Pane: Student Search & Dues Broadsheet
            Surface(
                modifier = Modifier.weight(1.3f).fillMaxHeight(),
                shape = RoundedCornerShape(12.dp),
                color = Color.White,
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
                    // Student Search Bar (F1)
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = searchAdmNo,
                            onValueChange = { searchAdmNo = it },
                            label = { Text("F1: Scan Barcode or Type Admission No") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        Button(
                            onClick = {},
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                        ) {
                            Text("Find Dues")
                        }
                    }

                    Spacer(Modifier.height(14.dp))

                    // Demographic Profile & Sibling Alert Banner
                    Surface(
                        color = Color(0xFFF8FAFC),
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Aarav Sharma", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF0F172A))
                                Text("Class 5-A • Roll 14", fontWeight = FontWeight.Medium, fontSize = 12.sp, color = Color(0xFF475569))
                            }
                            Text("Father: Rajesh Sharma (9876543210)", fontSize = 12.sp, color = Color(0xFF64748B), modifier = Modifier.padding(top = 2.dp))
                            
                            // Sibling Concession Chip
                            Surface(
                                color = Color(0xFFF5F3FF),
                                shape = RoundedCornerShape(4.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFDDD6FE)),
                                modifier = Modifier.padding(top = 6.dp)
                            ) {
                                Text(
                                    "Linked Sibling: Ananya Sharma (Class 2-B) • 25% Sibling Discount Active",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF6D28D9),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Spacer(Modifier.height(16.dp))

                    Text("OUTSTANDING FEE INVOICE: NOVEMBER 2026", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF475569))
                    Spacer(Modifier.height(8.dp))

                    // Fee Heads Checklist
                    feeItems.forEachIndexed { index, head ->
                        Surface(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            color = if (head.isSelected) Color(0xFFF8FAFC) else Color.White,
                            shape = RoundedCornerShape(6.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0))
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(horizontal = 10.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Checkbox(
                                        checked = head.isSelected,
                                        onCheckedChange = { checked ->
                                            feeItems[index] = head.copy(isSelected = checked)
                                        }
                                    )
                                    Spacer(Modifier.width(6.dp))
                                    Column {
                                        Text(head.name, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Color(0xFF1E293B))
                                        if (head.concessionDeduction > BigDecimal.ZERO) {
                                            Text("(-) Sibling 25% Concession: -₹${head.concessionDeduction}", fontSize = 11.sp, color = Color(0xFF059669))
                                        }
                                    }
                                }

                                Text(
                                    "₹${head.netAmount}",
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = Color(0xFF0F172A)
                                )
                            }
                        }
                    }

                    Spacer(Modifier.height(16.dp))

                    // Tendered & Change Section
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        OutlinedTextField(
                            value = amountTenderedStr,
                            onValueChange = { amountTenderedStr = it },
                            label = { Text("Amount Tendered (Cash)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )

                        Surface(
                            modifier = Modifier.weight(1f),
                            color = Color(0xFFF1F5F9),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text("Change Due to Parent:", fontSize = 11.sp, color = Color(0xFF64748B))
                                Text("₹${changeDue}", fontFamily = FontFamily.Monospace, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669))
                            }
                        }
                    }

                    Spacer(Modifier.height(20.dp))

                    // Big F3 Collect & Print Button
                    Button(
                        onClick = { handleCollectAndPrint() },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("F3: COLLECT ₹$netPayable & PRINT ESC/POS RECEIPT", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            // Right Pane: 80mm Physical Thermal Receipt Emulation
            Surface(
                modifier = Modifier.weight(1f).fillMaxHeight(),
                shape = RoundedCornerShape(12.dp),
                color = Color.White,
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("THERMAL RECEIPT PREVIEW (80mm)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF64748B))
                        Text("USB COM3 / Raw Spooler", fontSize = 11.sp, color = Color(0xFF94A3B8), fontFamily = FontFamily.Monospace)
                    }

                    Spacer(Modifier.height(12.dp))

                    // Monospace Tape
                    Surface(
                        modifier = Modifier.fillMaxWidth().weight(1f),
                        color = Color(0xFFF8FAFC),
                        shape = RoundedCornerShape(6.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFCBD5E1))
                    ) {
                        Column(
                            modifier = Modifier.fillMaxSize().padding(12.dp).verticalScroll(rememberScrollState()),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("DELHI PUBLIC SCHOOL", fontWeight = FontWeight.Bold, fontSize = 14.sp, fontFamily = FontFamily.Monospace)
                            Text("RANCHI, JHARKHAND", fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                            Text("Affiliation: 3430042 • Code: 08124", fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                            Text("----------------------------------------", fontFamily = FontFamily.Monospace, color = Color.Gray)

                            Column(modifier = Modifier.fillMaxWidth()) {
                                Text("Receipt No : $lastReceiptNo", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                                Text("Student    : Aarav Sharma (Class 5-A)", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                                Text("Adm No     : $searchAdmNo • Roll: 14", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                                Text("----------------------------------------", fontFamily = FontFamily.Monospace, color = Color.Gray)

                                for (item in selectedItems) {
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text(item.name.take(20), fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                                        Text("₹${item.netAmount}", fontFamily = FontFamily.Monospace, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                Text("----------------------------------------", fontFamily = FontFamily.Monospace, color = Color.Gray)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("TOTAL PAID (CASH):", fontFamily = FontFamily.Monospace, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    Text("₹$netPayable", fontFamily = FontFamily.Monospace, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Remaining Balance:", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                                    Text("₹0.00", fontFamily = FontFamily.Monospace, fontSize = 11.sp)
                                }
                                Text("----------------------------------------", fontFamily = FontFamily.Monospace, color = Color.Gray)
                            }

                            Spacer(Modifier.height(8.dp))
                            // Simulated QR
                            Surface(
                                modifier = Modifier.size(80.dp),
                                color = Color.White,
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color.Black)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text("[QR CODE]\nverify.schoolos.in", fontSize = 8.sp, fontFamily = FontFamily.Monospace, color = Color.DarkGray)
                                }
                            }
                            Spacer(Modifier.height(6.dp))
                            Text("Thank You! • Computer Generated", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color.Gray)
                            if (!isOnline) {
                                Text("*** PROVISIONAL OFFLINE RECEIPT ***", fontSize = 10.sp, fontFamily = FontFamily.Monospace, color = Color(0xFFB45309), fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
