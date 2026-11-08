package timetable

import (
	"fmt"
	"sort"
	"time"

	"github.com/google/uuid"
)

type DayOfWeek int

const (
	Monday DayOfWeek = 1 + iota
	Tuesday
	Wednesday
	Thursday
	Friday
	Saturday
)

type TimetableSlot struct {
	SlotID       uuid.UUID `json:"slot_id"`
	Day          DayOfWeek `json:"day"`
	PeriodNumber int       `json:"period_number"` // 1 through 8
	ClassID      uuid.UUID `json:"class_id"`
	ClassName    string    `json:"class_name"`
	SectionName  string    `json:"section_name"`
	SubjectID    uuid.UUID `json:"subject_id"`
	SubjectName  string    `json:"subject_name"`
	TeacherID    uuid.UUID `json:"teacher_id"`
	TeacherName  string    `json:"teacher_name"`
	RoomID       uuid.UUID `json:"room_id"`
	RoomName     string    `json:"room_name"`
	RoomCapacity int       `json:"room_capacity"`
	StudentCount int       `json:"student_count"`
	IsHeavySubj  bool      `json:"is_heavy_subject"` // Math, Physics, Chemistry
}

type TeacherProfile struct {
	TeacherID           uuid.UUID `json:"teacher_id"`
	TeacherName         string    `json:"teacher_name"`
	PrimarySubjects     []string  `json:"primary_subjects"`
	WeeklySubstitutions int       `json:"weekly_substitutions"`
	IsPresent           bool      `json:"is_present"`
}

type TimetableConflict struct {
	ConflictType string `json:"conflict_type"` // TEACHER_COLLISION, ROOM_OVERFLOW, EXCESSIVE_CONSECUTIVE_HEAVY
	Description  string `json:"description"`
	Day          DayOfWeek `json:"day"`
	PeriodNumber int       `json:"period_number"`
}

type SubstitutionRecommendation struct {
	PeriodNumber     int       `json:"period_number"`
	Day              DayOfWeek `json:"day"`
	AbsentTeacherID  uuid.UUID `json:"absent_teacher_id"`
	AbsentTeacher    string    `json:"absent_teacher"`
	ClassName        string    `json:"class_name"`
	SectionName      string    `json:"section_name"`
	SubjectName      string    `json:"subject_name"`
	AssignedSubID    uuid.UUID `json:"assigned_sub_id"`
	AssignedSubName  string    `json:"assigned_sub_name"`
	AffinityScore    int       `json:"affinity_score"`
	LessonNotes      string    `json:"lesson_notes"`
}

// ValidateTimetableHardConstraints checks:
// 1. Zero teacher collisions (a teacher cannot be in 2 classes in the same period).
// 2. Room capacity check (room capacity >= student count).
// 3. Max consecutive periods for heavy subjects (capped at 2).
func ValidateTimetableHardConstraints(slots []TimetableSlot) []TimetableConflict {
	var conflicts []TimetableConflict

	// 1. Teacher collision check: (Day, Period, TeacherID) -> slot
	teacherSchedule := make(map[string]TimetableSlot)

	// 2. Room collision check: (Day, Period, RoomID) -> slot
	roomSchedule := make(map[string]TimetableSlot)

	// Sort slots by class, day, period for consecutive check
	classSchedule := make(map[string][]TimetableSlot) // classID:day -> sorted slots

	for _, s := range slots {
		// Teacher collision
		teacherKey := fmt.Sprintf("%d:%d:%s", s.Day, s.PeriodNumber, s.TeacherID)
		if existing, exists := teacherSchedule[teacherKey]; exists {
			conflicts = append(conflicts, TimetableConflict{
				ConflictType: "TEACHER_COLLISION",
				Description:  fmt.Sprintf("Teacher %s double-booked in %s-%s and %s-%s at Period %d", s.TeacherName, existing.ClassName, existing.SectionName, s.ClassName, s.SectionName, s.PeriodNumber),
				Day:          s.Day,
				PeriodNumber: s.PeriodNumber,
			})
		} else {
			teacherSchedule[teacherKey] = s
		}

		// Room overflow check
		if s.RoomCapacity > 0 && s.StudentCount > s.RoomCapacity {
			conflicts = append(conflicts, TimetableConflict{
				ConflictType: "ROOM_OVERFLOW",
				Description:  fmt.Sprintf("Room %s capacity (%d) exceeded by %s-%s (%d students)", s.RoomName, s.RoomCapacity, s.ClassName, s.SectionName, s.StudentCount),
				Day:          s.Day,
				PeriodNumber: s.PeriodNumber,
			})
		}

		// Room collision check
		roomKey := fmt.Sprintf("%d:%d:%s", s.Day, s.PeriodNumber, s.RoomID)
		if existingRoom, exists := roomSchedule[roomKey]; exists {
			conflicts = append(conflicts, TimetableConflict{
				ConflictType: "ROOM_COLLISION",
				Description:  fmt.Sprintf("Room %s double-booked by %s and %s at Period %d", s.RoomName, existingRoom.ClassName, s.ClassName, s.PeriodNumber),
				Day:          s.Day,
				PeriodNumber: s.PeriodNumber,
			})
		} else {
			roomSchedule[roomKey] = s
		}

		classKey := fmt.Sprintf("%s:%d", s.ClassID, s.Day)
		classSchedule[classKey] = append(classSchedule[classKey], s)
	}

	// 3. Max consecutive heavy periods check
	for _, daySlots := range classSchedule {
		sort.Slice(daySlots, func(i, j int) bool {
			return daySlots[i].PeriodNumber < daySlots[j].PeriodNumber
		})

		consecutiveHeavy := 0
		for _, s := range daySlots {
			if s.IsHeavySubj {
				consecutiveHeavy++
				if consecutiveHeavy > 2 {
					conflicts = append(conflicts, TimetableConflict{
						ConflictType: "EXCESSIVE_CONSECUTIVE_HEAVY",
						Description:  fmt.Sprintf("%s-%s has %d consecutive heavy periods ending at Period %d", s.ClassName, s.SectionName, consecutiveHeavy, s.PeriodNumber),
						Day:          s.Day,
						PeriodNumber: s.PeriodNumber,
					})
				}
			} else {
				consecutiveHeavy = 0
			}
		}
	}

	return conflicts
}

// AutoAssignSubstitutions optimizes daily teacher substitution when a teacher reports absent
func AutoAssignSubstitutions(
	absentTeacherID uuid.UUID,
	day DayOfWeek,
	masterSchedule []TimetableSlot,
	allTeachers []TeacherProfile,
) ([]SubstitutionRecommendation, error) {
	// Find absent teacher's periods on this day
	var affectedSlots []TimetableSlot
	var absentTeacherName string

	for _, s := range masterSchedule {
		if s.TeacherID == absentTeacherID && s.Day == day {
			affectedSlots = append(affectedSlots, s)
			absentTeacherName = s.TeacherName
		}
	}

	if len(affectedSlots) == 0 {
		return nil, fmt.Errorf("NO_SLOTS: Absent teacher has no scheduled periods on day %d", day)
	}

	// For each affected period, find free available teachers
	recommendations := make([]SubstitutionRecommendation, 0, len(affectedSlots))

	for _, slot := range affectedSlots {
		// Identify teachers who are currently teaching in this period
		busyTeachers := make(map[uuid.UUID]bool)
		for _, s := range masterSchedule {
			if s.Day == day && s.PeriodNumber == slot.PeriodNumber {
				busyTeachers[s.TeacherID] = true
			}
		}

		type Candidate struct {
			Teacher TeacherProfile
			Score   int // Higher is better
		}

		var candidates []Candidate

		for _, t := range allTeachers {
			// Skip absent teacher, non-present teachers, and busy teachers
			if t.TeacherID == absentTeacherID || !t.IsPresent || busyTeachers[t.TeacherID] {
				continue
			}

			score := 100 - (t.WeeklySubstitutions * 10) // Workload balancing penalty

			// Subject affinity bonus
			for _, sub := range t.PrimarySubjects {
				if sub == slot.SubjectName {
					score += 50
					break
				}
			}

			candidates = append(candidates, Candidate{Teacher: t, Score: score})
		}

		if len(candidates) == 0 {
			return nil, fmt.Errorf("NO_AVAILABLE_TEACHERS: No free substitute teachers available for Period %d", slot.PeriodNumber)
		}

		// Sort by score descending (highest affinity & lowest workload first)
		sort.Slice(candidates, func(i, j int) bool {
			return candidates[i].Score > candidates[j].Score
		})

		bestMatch := candidates[0].Teacher

		recommendations = append(recommendations, SubstitutionRecommendation{
			PeriodNumber:    slot.PeriodNumber,
			Day:             day,
			AbsentTeacherID: absentTeacherID,
			AbsentTeacher:   absentTeacherName,
			ClassName:       slot.ClassName,
			SectionName:     slot.SectionName,
			SubjectName:     slot.SubjectName,
			AssignedSubID:   bestMatch.TeacherID,
			AssignedSubName: bestMatch.TeacherName,
			AffinityScore:   candidates[0].Score,
			LessonNotes:     fmt.Sprintf("Continue NCERT Chapter revision for %s in %s-%s", slot.SubjectName, slot.ClassName, slot.SectionName),
		})
	}

	return recommendations, nil
}

// CurrentDayOfWeek converts time.Weekday to custom DayOfWeek
func CurrentDayOfWeek(t time.Time) DayOfWeek {
	switch t.Weekday() {
	case time.Monday:
		return Monday
	case time.Tuesday:
		return Tuesday
	case time.Wednesday:
		return Wednesday
	case time.Thursday:
		return Thursday
	case time.Friday:
		return Friday
	case time.Saturday:
		return Saturday
	default:
		return Monday
	}
}
