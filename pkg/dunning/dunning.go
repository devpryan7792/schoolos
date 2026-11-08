package dunning

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// DunningState represents the progressive status of an invoice in the dunning lifecycle
type DunningState string

const (
	StateUpcomingDue    DunningState = "UPCOMING_DUE"     // 5 to 1 days before due date
	StateDueDateToday   DunningState = "DUE_DATE_TODAY"   // On due date
	StateGracePeriod    DunningState = "GRACE_PERIOD"     // Days 1-3 after due date (no late fee)
	StateDunningStage1  DunningState = "DUNNING_STAGE_1"   // Days 4-7 (gentle reminder)
	StateDunningStage2  DunningState = "DUNNING_STAGE_2"   // Days 8-10 (firm warning of late fee)
	StateLateFeeLevied  DunningState = "LATE_FEE_LEVIED"   // Day 11+ (late fee added)
	StateAdmitCardLocked DunningState = "ADMIT_CARD_LOCKED" // Prior to exams if still unpaid
	StateSettled        DunningState = "SETTLED"          // Paid in full
)

type DunningPlan struct {
	InvoiceID         uuid.UUID
	StudentID         uuid.UUID
	StudentName       string
	AdmissionNumber   string
	GuardianName      string
	GuardianPhone     string
	DueDate           time.Time
	GrossAmount       decimal.Decimal
	LateFeeAmount     decimal.Decimal
	CurrentDues       decimal.Decimal
	CurrentState      DunningState
	ConsecutiveAbsences int
	AcademicTrendDropPct float64
	IsDropoutRisk     bool
	NextActionDate    time.Time
	LastNotificationSent time.Time
}

// ComputeDunningState determines the state of an invoice given the current date and payment status
func ComputeDunningState(dueDate time.Time, currentDues decimal.Decimal, today time.Time) DunningState {
	if currentDues.IsZero() || currentDues.IsNegative() {
		return StateSettled
	}

	diffDays := int(today.Sub(dueDate).Hours() / 24)

	switch {
	case diffDays < -1:
		return StateUpcomingDue
	case diffDays >= -1 && diffDays <= 0:
		return StateDueDateToday
	case diffDays >= 1 && diffDays <= 3:
		return StateGracePeriod
	case diffDays >= 4 && diffDays <= 7:
		return StateDunningStage1
	case diffDays >= 8 && diffDays <= 10:
		return StateDunningStage2
	case diffDays > 10 && diffDays <= 30:
		return StateLateFeeLevied
	default:
		return StateAdmitCardLocked
	}
}

// FormatDunningMessage generates progressive, respectful localized WhatsApp messages with UPI links
func FormatDunningMessage(plan DunningPlan, upiVpa, schoolName string) (headline string, message string, upiLink string) {
	invoiceNumber := fmt.Sprintf("INV-%s", plan.InvoiceID.String()[:8])
	amountStr := plan.CurrentDues.StringFixed(2)

	// Dynamic UPI link with exact amount and invoice reference
	upiLink = fmt.Sprintf(
		"upi://pay?pa=%s&pn=%s&am=%s&tr=%s&cu=INR&tn=Fee_%s",
		upiVpa,
		strings.ReplaceAll(schoolName, " ", "%20"),
		amountStr,
		invoiceNumber,
		plan.AdmissionNumber,
	)

	switch plan.CurrentState {
	case StateUpcomingDue:
		headline = fmt.Sprintf("Fee Reminder: ₹%s due on %s", amountStr, plan.DueDate.Format("02 Jan"))
		message = fmt.Sprintf(
			"Namaste %s ji,\n\n"+
				"%s (%s) ki %s mahine ki school fee ₹%s ki due date *%s* hai.\n\n"+
				"Samay par bhugtan kar kisi bhi asuvidha se bachein. Aap neeche diye gaye link se turant UPI dwara bhugtan kar sakte hain:\n👉 %s",
			plan.GuardianName, plan.StudentName, plan.AdmissionNumber,
			plan.DueDate.Format("January"), amountStr, plan.DueDate.Format("02 Jan 2006"), upiLink,
		)

	case StateDueDateToday:
		headline = fmt.Sprintf("Due Today: ₹%s for %s", amountStr, plan.StudentName)
		message = fmt.Sprintf(
			"Namaste %s ji,\n\n"+
				"Aaj %s (%s) ki school fee ₹%s bhugtan karne ki aakhri tarikh hai.\n\n"+
				"Kripya aaj hi bhugtan karein:\n👉 %s",
			plan.GuardianName, plan.StudentName, plan.AdmissionNumber, amountStr, upiLink,
		)

	case StateGracePeriod:
		headline = fmt.Sprintf("Grace Period: ₹%s Pending", amountStr)
		message = fmt.Sprintf(
			"Namaste %s ji,\n\n"+
				"%s ki fee due date nikal chuki hai. Grace period ke tehat agle 3 dino tak koi late fee nahi lagegi.\n\n"+
				"Shighra bhugtan karein:\n👉 %s",
			plan.GuardianName, plan.StudentName, upiLink,
		)

	case StateDunningStage1:
		headline = fmt.Sprintf("Urgent Reminder: ₹%s Pending", amountStr)
		message = fmt.Sprintf(
			"Namaste %s ji,\n\n"+
				"%s ki school fee ₹%s abhi tak prapt nahi hui hai. Late fee se bachne ke liye kripya jald se jald bhugtan karein.\n\n"+
				"UPI Link:\n👉 %s",
			plan.GuardianName, plan.StudentName, amountStr, upiLink,
		)

	case StateDunningStage2:
		headline = fmt.Sprintf("Final Notice before Late Fee: ₹%s", amountStr)
		message = fmt.Sprintf(
			"Aadarniya %s ji,\n\n"+
				"%s ki fee par 10th ke baad ₹%s late fee jodi jayegi.\n\n"+
				"Kul deya rashi: *₹%s*.\nTurant bhugtan karein:\n👉 %s",
			plan.GuardianName, plan.StudentName, plan.LateFeeAmount.StringFixed(2), amountStr, upiLink,
		)

	case StateLateFeeLevied:
		headline = fmt.Sprintf("Late Fee Applied: ₹%s Outstanding", amountStr)
		message = fmt.Sprintf(
			"Soochna: %s ki fee par late fee jod di gayi hai. Kul bacha hua fee: *₹%s*.\n\n"+
				"Kripya turant bhugtan kar khata clear karein:\n👉 %s",
			plan.StudentName, amountStr, upiLink,
		)

	case StateAdmitCardLocked:
		headline = "Admit Card Withheld: Outstanding Dues"
		message = fmt.Sprintf(
			"ATTENTION: %s ka aane wali pariksha ka Admit Card fee pending (₹%s) hone ke karan hold par hai.\n\n"+
				"Admit Card download unlock karne ke liye turant UPI se dues clear karein:\n👉 %s",
			plan.StudentName, amountStr, upiLink,
		)

	default:
		headline = "Fee Settled"
		message = fmt.Sprintf("%s ki sabhi fee purna roop se jama hai. Dhanyawad!", plan.StudentName)
	}

	return headline, message, upiLink
}

// EvaluateDropoutRisk checks if student has 5+ consecutive unexcused absences or >20% academic drop
func EvaluateDropoutRisk(consecutiveAbsences int, scoreDropPct float64) (isRisk bool, reason string) {
	if consecutiveAbsences >= 5 {
		return true, fmt.Sprintf("Critical Attendance Risk: %d consecutive days absent without leave", consecutiveAbsences)
	}
	if scoreDropPct >= 20.0 {
		return true, fmt.Sprintf("Academic Attrition Risk: Recent test scores dropped by %.1f%%", scoreDropPct)
	}
	return false, "Normal Risk Profile"
}

// PrincipalMorningDigest aggregates operational metrics for the morning briefing card
type PrincipalMorningDigest struct {
	ReportDate             string          `json:"report_date"`
	YesterdayFeeCollected  decimal.Decimal `json:"yesterday_fee_collected"`
	TodayStaffAbsent       int             `json:"today_staff_absent"`
	TodayStaffTotal        int             `json:"today_staff_total"`
	StudentAttendancePct   float64         `json:"student_attendance_pct"`
	ActiveBusesOnRoute     int             `json:"active_buses_on_route"`
	TotalBuses             int             `json:"total_buses"`
	HighDropoutRiskCount   int             `json:"high_dropout_risk_count"`
	CriticalAlerts         []string        `json:"critical_alerts"`
}

func GeneratePrincipalDigest(
	yesterdayFees decimal.Decimal,
	staffAbsent, staffTotal int,
	studentPresent, studentTotal int,
	busesActive, busesTotal int,
	atRiskCount int,
) PrincipalMorningDigest {
	pct := 0.0
	if studentTotal > 0 {
		pct = float64(studentPresent) / float64(studentTotal) * 100.0
	}

	alerts := []string{}
	if staffAbsent > 3 {
		alerts = append(alerts, fmt.Sprintf("%d teachers absent today — automated substitute timetable dispatched", staffAbsent))
	}
	if atRiskCount > 0 {
		alerts = append(alerts, fmt.Sprintf("%d students flagged with consecutive absence dropout risks", atRiskCount))
	}
	if busesActive < busesTotal {
		alerts = append(alerts, fmt.Sprintf("%d bus idle/in-maintenance — backup vans assigned", busesTotal-busesActive))
	}

	return PrincipalMorningDigest{
		ReportDate:            time.Now().Format("Monday, 02 January 2006"),
		YesterdayFeeCollected: yesterdayFees,
		TodayStaffAbsent:      staffAbsent,
		TodayStaffTotal:       staffTotal,
		StudentAttendancePct:  pct,
		ActiveBusesOnRoute:    busesActive,
		TotalBuses:            busesTotal,
		HighDropoutRiskCount:  atRiskCount,
		CriticalAlerts:        alerts,
	}
}
