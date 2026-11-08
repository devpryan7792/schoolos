package timetable

import (
	"strings"
	"testing"

	"github.com/google/uuid"
)

func TestTimetableHardConstraintViolations(t *testing.T) {
	teacherA := uuid.New()
	class10A := uuid.New()
	class10B := uuid.New()
	room101 := uuid.New()
	room102 := uuid.New()

	slotsWithCollision := []TimetableSlot{
		// Teacher A booked in 10A (Room 101) Period 1
		{
			SlotID:       uuid.New(),
			Day:          Monday,
			PeriodNumber: 1,
			ClassID:      class10A,
			ClassName:    "Class 10",
			SectionName:  "A",
			SubjectName:  "Mathematics",
			TeacherID:    teacherA,
			TeacherName:  "Mr. Sharma",
			RoomID:       room101,
			RoomName:     "Room 101",
			RoomCapacity: 45,
			StudentCount: 40,
			IsHeavySubj:  true,
		},
		// Teacher A ALSO booked in 10B (Room 102) Period 1 -> Hard Collision!
		{
			SlotID:       uuid.New(),
			Day:          Monday,
			PeriodNumber: 1,
			ClassID:      class10B,
			ClassName:    "Class 10",
			SectionName:  "B",
			SubjectName:  "Physics",
			TeacherID:    teacherA,
			TeacherName:  "Mr. Sharma",
			RoomID:       room102,
			RoomName:     "Room 102",
			RoomCapacity: 45,
			StudentCount: 40,
			IsHeavySubj:  true,
		},
		// Room 101 capacity 45 exceeded by 50 students in Period 2
		{
			SlotID:       uuid.New(),
			Day:          Monday,
			PeriodNumber: 2,
			ClassID:      class10A,
			ClassName:    "Class 10",
			SectionName:  "A",
			SubjectName:  "English",
			TeacherID:    uuid.New(),
			TeacherName:  "Mrs. Sen",
			RoomID:       room101,
			RoomName:     "Room 101",
			RoomCapacity: 45,
			StudentCount: 50, // Overflow!
			IsHeavySubj:  false,
		},
	}

	conflicts := ValidateTimetableHardConstraints(slotsWithCollision)
	if len(conflicts) != 2 {
		t.Fatalf("Expected 2 conflicts (1 collision + 1 overflow), got %d: %+v", len(conflicts), conflicts)
	}

	hasCollision := false
	hasOverflow := false
	for _, c := range conflicts {
		if c.ConflictType == "TEACHER_COLLISION" {
			hasCollision = true
		}
		if c.ConflictType == "ROOM_OVERFLOW" {
			hasOverflow = true
		}
	}

	if !hasCollision || !hasOverflow {
		t.Fatalf("Expected both TEACHER_COLLISION and ROOM_OVERFLOW, got %+v", conflicts)
	}
}

func TestExcessiveConsecutiveHeavyPeriods(t *testing.T) {
	classID := uuid.New()
	roomID := uuid.New()

	// 3 consecutive heavy periods in Class 10A: Period 1 (Math), Period 2 (Physics), Period 3 (Chemistry)
	heavySlots := []TimetableSlot{
		{Day: Monday, PeriodNumber: 1, ClassID: classID, ClassName: "Class 10", SectionName: "A", SubjectName: "Math", TeacherID: uuid.New(), RoomID: roomID, RoomCapacity: 50, StudentCount: 40, IsHeavySubj: true},
		{Day: Monday, PeriodNumber: 2, ClassID: classID, ClassName: "Class 10", SectionName: "A", SubjectName: "Physics", TeacherID: uuid.New(), RoomID: roomID, RoomCapacity: 50, StudentCount: 40, IsHeavySubj: true},
		{Day: Monday, PeriodNumber: 3, ClassID: classID, ClassName: "Class 10", SectionName: "A", SubjectName: "Chemistry", TeacherID: uuid.New(), RoomID: roomID, RoomCapacity: 50, StudentCount: 40, IsHeavySubj: true},
	}

	conflicts := ValidateTimetableHardConstraints(heavySlots)
	if len(conflicts) != 1 || conflicts[0].ConflictType != "EXCESSIVE_CONSECUTIVE_HEAVY" {
		t.Fatalf("Expected EXCESSIVE_CONSECUTIVE_HEAVY conflict, got: %+v", conflicts)
	}
}

func TestAutoAssignSubstitutionsOptimizer(t *testing.T) {
	absentTeacherID := uuid.New()
	tMathSubstitute := uuid.New()
	tEnglishSubstitute := uuid.New()
	tBusyTeacher := uuid.New()

	// Master timetable: Absent teacher has Math in 10A at Period 2
	master := []TimetableSlot{
		{
			Day:          Monday,
			PeriodNumber: 2,
			ClassID:      uuid.New(),
			ClassName:    "Class 10",
			SectionName:  "A",
			SubjectName:  "Mathematics",
			TeacherID:    absentTeacherID,
			TeacherName:  "Mr. Verma",
			RoomID:       uuid.New(),
			RoomName:     "101",
			RoomCapacity: 45,
			StudentCount: 40,
		},
		// Busy teacher is teaching elsewhere in Period 2
		{
			Day:          Monday,
			PeriodNumber: 2,
			ClassID:      uuid.New(),
			ClassName:    "Class 9",
			SectionName:  "B",
			SubjectName:  "History",
			TeacherID:    tBusyTeacher,
			TeacherName:  "Mr. Ray",
			RoomID:       uuid.New(),
			RoomName:     "102",
			RoomCapacity: 45,
			StudentCount: 40,
		},
	}

	allTeachers := []TeacherProfile{
		// Candidate 1: Math teacher, free in Period 2, 1 past substitution -> Highest affinity!
		{
			TeacherID:           tMathSubstitute,
			TeacherName:         "Mrs. Agarwal",
			PrimarySubjects:     []string{"Mathematics", "Statistics"},
			WeeklySubstitutions: 1,
			IsPresent:           true,
		},
		// Candidate 2: English teacher, free in Period 2, 3 past substitutions -> Lower affinity
		{
			TeacherID:           tEnglishSubstitute,
			TeacherName:         "Mr. Das",
			PrimarySubjects:     []string{"English"},
			WeeklySubstitutions: 3,
			IsPresent:           true,
		},
		// Candidate 3: Busy teacher -> Must be excluded
		{
			TeacherID:           tBusyTeacher,
			TeacherName:         "Mr. Ray",
			PrimarySubjects:     []string{"History"},
			WeeklySubstitutions: 0,
			IsPresent:           true,
		},
	}

	recs, err := AutoAssignSubstitutions(absentTeacherID, Monday, master, allTeachers)
	if err != nil {
		t.Fatalf("Substitution optimization failed: %v", err)
	}

	if len(recs) != 1 {
		t.Fatalf("Expected 1 substitution recommendation, got %d", len(recs))
	}

	rec := recs[0]
	if rec.AssignedSubID != tMathSubstitute || rec.AssignedSubName != "Mrs. Agarwal" {
		t.Fatalf("Expected Mrs. Agarwal (Math affinity) to be chosen, got: %s", rec.AssignedSubName)
	}
	if !strings.Contains(rec.LessonNotes, "Mathematics") {
		t.Fatalf("Expected lesson notes mentioning subject, got: %s", rec.LessonNotes)
	}
}
