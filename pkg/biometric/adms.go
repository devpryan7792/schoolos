package biometric

import (
	"bufio"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type PunchType int

const (
	PunchCheckIn  PunchType = 0
	PunchCheckOut PunchType = 1
	PunchBreakOut PunchType = 2
	PunchBreakIn  PunchType = 3
)

type BiometricPunch struct {
	DeviceSerial string
	UserPIN      string
	Timestamp    time.Time
	PunchType    PunchType
	VerifyType   int // 1=Fingerprint, 20=Face, 2=Card
	IsLate       bool
	LateMinutes  int
}

type ShiftPolicy struct {
	ShiftStartHour   int // e.g. 8 for 08:00 AM
	ShiftStartMinute int // e.g. 0
	GracePeriodMins  int // e.g. 15 mins (up to 08:15 AM is not late)
	LateThresholdMins int // e.g. 60 mins (after which is half-day)
}

// DefaultSchoolShiftPolicy provides standard 08:00 AM reporting with 15-minute grace period
func DefaultSchoolShiftPolicy() ShiftPolicy {
	return ShiftPolicy{
		ShiftStartHour:    8,
		ShiftStartMinute:  0,
		GracePeriodMins:   15,
		LateThresholdMins: 60,
	}
}

// ParseADMSPunches parses the raw body sent by eSSL/ZKTeco devices to POST /iclock/cdata
// Format per line: <PIN>\t<YYYY-MM-DD HH:MM:SS>\t<Status>\t<VerifyType>
func ParseADMSPunches(deviceSerial string, body string, policy ShiftPolicy) ([]BiometricPunch, error) {
	scanner := bufio.NewScanner(strings.NewReader(body))
	var punches []BiometricPunch

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}

		parts := strings.Split(line, "\t")
		if len(parts) < 2 {
			// Some devices use space or comma delimiters
			parts = strings.Fields(line)
			if len(parts) < 2 {
				continue
			}
		}

		pin := parts[0]
		timeStr := parts[1]
		if len(parts) >= 3 && strings.Contains(timeStr, "-") == false && strings.Contains(parts[2], "-") {
			// Delimiter shift safety
			timeStr = parts[1] + " " + parts[2]
		}

		// Try parsing common biometric timestamps
		var punchTime time.Time
		var err error
		layouts := []string{
			"2006-01-02 15:04:05",
			"2006/01/02 15:04:05",
			"2006-01-02T15:04:05",
		}
		for _, layout := range layouts {
			punchTime, err = time.Parse(layout, timeStr)
			if err == nil {
				break
			}
		}
		if err != nil {
			continue // Skip malformed timestamp line without dropping batch
		}

		punchType := PunchCheckIn
		if len(parts) >= 3 {
			if pt, err := strconv.Atoi(parts[2]); err == nil {
				punchType = PunchType(pt)
			}
		}

		verifyType := 1
		if len(parts) >= 4 {
			if vt, err := strconv.Atoi(parts[3]); err == nil {
				verifyType = vt
			}
		}

		// Check late arrival if it's a check-in
		isLate := false
		lateMinutes := 0
		if punchType == PunchCheckIn {
			shiftStart := time.Date(
				punchTime.Year(), punchTime.Month(), punchTime.Day(),
				policy.ShiftStartHour, policy.ShiftStartMinute, 0, 0, punchTime.Location(),
			)
			graceCutoff := shiftStart.Add(time.Duration(policy.GracePeriodMins) * time.Minute)

			if punchTime.After(graceCutoff) {
				isLate = true
				lateMinutes = int(punchTime.Sub(shiftStart).Minutes())
			}
		}

		punches = append(punches, BiometricPunch{
			DeviceSerial: deviceSerial,
			UserPIN:      pin,
			Timestamp:    punchTime,
			PunchType:    punchType,
			VerifyType:   verifyType,
			IsLate:       isLate,
			LateMinutes:  lateMinutes,
		})
	}

	return punches, nil
}

// ComputeLateClockInPenalties checks if 3 or more late check-ins occurred in a calendar month
func ComputeLateClockInPenalties(staffID uuid.UUID, monthPunches []BiometricPunch) (lateCount int, halfDayDeductions int) {
	lateCount = 0
	for _, p := range monthPunches {
		if p.PunchType == PunchCheckIn && p.IsLate {
			lateCount++
		}
	}
	// Every 3 late arrivals = 1 half-day leave deduction
	halfDayDeductions = lateCount / 3
	return lateCount, halfDayDeductions
}

// ADMSHandler handles eSSL / Realtime hardware push endpoints
func HandleADMSRequest(w http.ResponseWriter, r *http.Request, policy ShiftPolicy) (int, error) {
	sn := r.URL.Query().Get("SN")
	if sn == "" {
		sn = "DEV-DEFAULT-ESSL"
	}

	switch r.Method {
	case http.MethodGet:
		// Device handshake / configuration ping
		w.Header().Set("Content-Type", "text/plain")
		_, _ = w.Write([]byte(fmt.Sprintf("GET OPTION FROM: %s\nATTLOGStamp=None\nOPERLOGStamp=None\nErrorDelay=30\nDelay=10\nTransTimes=00:00;14:00\nTransInterval=1\nTransFlag=1111000000\nTimeZone=5.5\nRealtime=1\nEncrypt=0", sn)))
		return 0, nil

	case http.MethodPost:
		// Inbound punch log upload
		buf := new(strings.Builder)
		scanner := bufio.NewScanner(r.Body)
		for scanner.Scan() {
			buf.WriteString(scanner.Text() + "\n")
		}

		punches, err := ParseADMSPunches(sn, buf.String(), policy)
		if err != nil {
			http.Error(w, "Failed to parse punch logs", http.StatusBadRequest)
			return 0, err
		}

		// Device protocol demands exact "OK: <count>" response to mark punches as acknowledged on device
		w.Header().Set("Content-Type", "text/plain")
		_, _ = w.Write([]byte(fmt.Sprintf("OK: %d", len(punches))))
		return len(punches), nil

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return 0, fmt.Errorf("unsupported method %s", r.Method)
	}
}
