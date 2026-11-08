package in.schoolos.mobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class StudentProfile(
    val id: String,
    val name: String,
    val className: String,
    val section: String,
    val admissionNo: String,
    val busRoute: String,
    val busReg: String,
    val feeDues: String,
    val attendance: String
)

val mockSiblingProfiles = listOf(
    StudentProfile("std-1", "Aarav Sharma", "Class 5", "A", "DPS-2024-042", "Route 4 (Hinoo Chowk)", "JH-01-BV-4021", "₹4,200.00", "PRESENT"),
    StudentProfile("std-2", "Ananya Sharma", "Class 2", "B", "DPS-2026-118", "Route 4 (Hinoo Chowk)", "JH-01-BV-4021", "₹0.00", "PRESENT")
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SchoolOSParentApp()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SchoolOSParentApp() {
    var selectedProfile by remember { mutableStateOf(mockSiblingProfiles[0]) }
    var isProfileDropdownOpen by remember { mutableStateOf(false) }
    val context = LocalContext.current

    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Color(0xFF2563EB),
            background = Color(0xFFF8FAFC),
            surface = Color.White
        )
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.clickable { isProfileDropdownOpen = true }
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(Color(0xFFDBEAFE), shape = CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    selectedProfile.name.take(1),
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E40AF),
                                    fontSize = 15.sp
                                )
                            }
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        selectedProfile.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = Color(0xFF0F172A)
                                    )
                                    Icon(
                                        Icons.Default.ArrowDropDown,
                                        contentDescription = "Switch Sibling",
                                        tint = Color(0xFF64748B)
                                    )
                                }
                                Text(
                                    "${selectedProfile.className}-${selectedProfile.section} • ${selectedProfile.admissionNo}",
                                    fontSize = 11.sp,
                                    color = Color(0xFF64748B)
                                )
                            }

                            DropdownMenu(
                                expanded = isProfileDropdownOpen,
                                onDismissRequest = { isProfileDropdownOpen = false }
                            ) {
                                mockSiblingProfiles.forEach { profile ->
                                    DropdownMenuItem(
                                        text = {
                                            Column {
                                                Text(profile.name, fontWeight = FontWeight.Bold)
                                                Text("${profile.className}-${profile.section} • ${profile.admissionNo}", fontSize = 11.sp, color = Color.Gray)
                                            }
                                        },
                                        onClick = {
                                            selectedProfile = profile
                                            isProfileDropdownOpen = false
                                        }
                                    )
                                }
                            }
                        }
                    },
                    actions = {
                        IconButton(onClick = {}) {
                            Icon(Icons.Default.Notifications, contentDescription = "Alerts", tint = Color(0xFF475569))
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
                )
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Color(0xFFF8FAFC))
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Live Bus Telemetry Card (SPECIFICATION.md Section 5.2)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier.size(32.dp).background(Color(0xFFEFF6FF), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.DirectionsBus, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(18.dp))
                                }
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("LIVE SCHOOL BUS TRACKER", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color(0xFF64748B))
                                    Text(selectedProfile.busRoute, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF0F172A))
                                }
                            }
                            Surface(
                                color = Color(0xFFECFDF5),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("EN ROUTE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF065F46), modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                            }
                        }

                        Spacer(Modifier.height(14.dp))

                        // Simulated MapLibre Viewport Container
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(160.dp)
                                .background(Color(0xFFE2E8F0), shape = RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(Icons.Default.LocationOn, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(32.dp))
                                Text("MapLibre GL Vector Tile Feed", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF1E293B))
                                Text("Next Stop: Circular Road Chowk (ETA 4 mins)", fontSize = 11.sp, color = Color(0xFF475569))
                            }
                        }

                        Spacer(Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Bus Speed: 34 km/h • Ignition ON", fontSize = 12.sp, color = Color(0xFF475569), fontWeight = FontWeight.Medium)
                            Text(selectedProfile.busReg, fontSize = 12.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, color = Color(0xFF1E3A8A))
                        }
                    }
                }

                // Fee Dues & 1-Tap UPI Intent Card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("NOVEMBER 2026 FEE DUES", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color(0xFF64748B))
                            Surface(
                                color = if (selectedProfile.feeDues == "₹0.00") Color(0xFFECFDF5) else Color(0xFFFEF2F2),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    if (selectedProfile.feeDues == "₹0.00") "PAID IN FULL" else "DUE 15 NOV",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selectedProfile.feeDues == "₹0.00") Color(0xFF065F46) else Color(0xFFB91C1C),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }

                        Spacer(Modifier.height(8.dp))

                        Text(
                            selectedProfile.feeDues,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            fontSize = 24.sp,
                            color = Color(0xFF0F172A)
                        )

                        if (selectedProfile.feeDues != "₹0.00") {
                            Spacer(Modifier.height(12.dp))
                            Button(
                                onClick = {
                                    val upiIntent = "upi://pay?pa=dpsschool@icici&pn=DelhiPublicSchool&am=4200.00&tr=INV-2026-0042&cu=INR"
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(upiIntent))
                                    context.startActivity(intent)
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Default.Payment, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(8.dp))
                                Text("Pay Instantly via UPI App (GPay / PhonePe)", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                // Daily Attendance & Timetable Status
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(24.dp))
                            Spacer(Modifier.width(10.dp))
                            Column {
                                Text("Today's Attendance", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("Marked at 07:52 AM via Biometric Roll Call", fontSize = 11.sp, color = Color(0xFF64748B))
                            }
                        }
                        Surface(
                            color = Color(0xFFECFDF5),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(selectedProfile.attendance, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF065F46), modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                        }
                    }
                }
            }
        }
    }
}
