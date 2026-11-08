import SwiftUI

struct StudentSiblingProfile: Identifiable {
    let id: String
    let name: String
    let className: String
    let section: String
    let admissionNo: String
    let busRoute: String
    let busReg: String
    let feeDues: String
    let attendance: String
}

let mockSiblingsList = [
    StudentSiblingProfile(id: "1", name: "Aarav Sharma", className: "Class 5", section: "A", admissionNo: "DPS-2024-042", busRoute: "Route 4 (Hinoo Chowk)", busReg: "JH-01-BV-4021", feeDues: "₹4,200.00", attendance: "PRESENT"),
    StudentSiblingProfile(id: "2", name: "Ananya Sharma", className: "Class 2", section: "B", admissionNo: "DPS-2026-118", busRoute: "Route 4 (Hinoo Chowk)", busReg: "JH-01-BV-4021", feeDues: "₹0.00", attendance: "PRESENT")
]

struct ContentView: View {
    @State private var selectedProfile = mockSiblingsList[0]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Sibling Profile Switcher Card (SPECIFICATION.md Section 5.1)
                    Menu {
                        ForEach(mockSiblingsList) { sibling in
                            Button(action: {
                                withAnimation(.spring(response: 0.3)) {
                                    selectedProfile = sibling
                                }
                            }) {
                                HStack {
                                    Text("\(sibling.name) (\(sibling.className)-\(sibling.section))")
                                    if selectedProfile.id == sibling.id {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                    } label: {
                        HStack {
                            Circle()
                                .fill(Color.blue.opacity(0.15))
                                .frame(width: 44, height: 44)
                                .overlay(
                                    Text(String(selectedProfile.name.prefix(1)))
                                        .font(.headline)
                                        .foregroundColor(.blue)
                                )
                            
                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    Text(selectedProfile.name)
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                    Image(systemName: "chevron.up.chevron.down")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                                Text("\(selectedProfile.className)-\(selectedProfile.section) • Adm: \(selectedProfile.admissionNo)")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            Text("Switch Child")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(Color.blue.opacity(0.1))
                                .foregroundColor(.blue)
                                .cornerRadius(8)
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(16)
                        .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
                    }

                    // Live Fleet Telemetry Bus Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "bus.fill")
                                .foregroundColor(.blue)
                            Text("LIVE BUS TELEMETRY")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text("EN ROUTE")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.green.opacity(0.15))
                                .foregroundColor(.green)
                                .cornerRadius(6)
                        }

                        Text(selectedProfile.busRoute)
                            .font(.headline)
                            .foregroundColor(.primary)

                        // Map Viewport Placeholder
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                                .frame(height: 150)
                            
                            VStack(spacing: 6) {
                                Image(systemName: "location.north.circle.fill")
                                    .font(.largeTitle)
                                    .foregroundColor(.blue)
                                Text("MapLibre GL Vector Map (Zero Cost)")
                                    .font(.caption)
                                    .fontWeight(.semibold)
                                Text("Next Stop: Circular Road Chowk (ETA 4m)")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }

                        HStack {
                            Text("Speed: 34 km/h • Ignition ON")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(selectedProfile.busReg)
                                .font(.caption)
                                .monospaced()
                                .fontWeight(.bold)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)

                    // Outstanding Fee Dues & UPI Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("NOVEMBER 2026 FEE DUES")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(selectedProfile.feeDues == "₹0.00" ? "PAID IN FULL" : "DUE 15 NOV")
                                .font(.caption2)
                                .fontWeight(.bold)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(selectedProfile.feeDues == "₹0.00" ? Color.green.opacity(0.15) : Color.red.opacity(0.15))
                                .foregroundColor(selectedProfile.feeDues == "₹0.00" ? .green : .red)
                                .cornerRadius(6)
                        }

                        Text(selectedProfile.feeDues)
                            .font(.system(size: 28, weight: .bold, design: .monospaced))

                        if selectedProfile.feeDues != "₹0.00" {
                            Link(destination: URL(string: "upi://pay?pa=dpsschool@icici&pn=DelhiPublicSchool&am=4200.00&tr=INV-2026-0042&cu=INR")!) {
                                HStack {
                                    Image(systemName: "creditcard.fill")
                                    Text("Pay Instantly via UPI / Apple Pay")
                                        .fontWeight(.bold)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)

                    // Daily Attendance Card
                    HStack {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.title2)
                            .foregroundColor(.green)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Today's Attendance")
                                .font(.subheadline)
                                .fontWeight(.bold)
                            Text("Marked Present via Gate Biometrics")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Text("PRESENT")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.green.opacity(0.15))
                            .foregroundColor(.green)
                            .cornerRadius(6)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("SchoolOS Parent")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
