from app.core.constants import (
    PhdStudentStatus,
    VALID_TRANSITIONS,
    SCORING,
    AUTHOR_ROLE_FACTOR,
)


class TestPhdStatusTransitions:
    def test_studying_to_leave(self):
        assert PhdStudentStatus.LEAVE in VALID_TRANSITIONS[PhdStudentStatus.STUDYING]

    def test_studying_to_extended(self):
        assert PhdStudentStatus.EXTENDED in VALID_TRANSITIONS[PhdStudentStatus.STUDYING]

    def test_studying_to_defended(self):
        assert PhdStudentStatus.DEFENDED in VALID_TRANSITIONS[PhdStudentStatus.STUDYING]

    def test_studying_to_dropped(self):
        assert PhdStudentStatus.DROPPED in VALID_TRANSITIONS[PhdStudentStatus.STUDYING]

    def test_leave_back_to_studying(self):
        assert PhdStudentStatus.STUDYING in VALID_TRANSITIONS[PhdStudentStatus.LEAVE]

    def test_extended_to_defended(self):
        assert PhdStudentStatus.DEFENDED in VALID_TRANSITIONS[PhdStudentStatus.EXTENDED]

    def test_defended_no_transitions(self):
        assert len(VALID_TRANSITIONS[PhdStudentStatus.DEFENDED]) == 0

    def test_dropped_no_transitions(self):
        assert len(VALID_TRANSITIONS[PhdStudentStatus.DROPPED]) == 0


class TestScoring:
    def test_isi_q1_score(self):
        assert SCORING["ISI"]["Q1"] == 10

    def test_scopus_q4_score(self):
        assert SCORING["SCOPUS"]["Q4"] == 2

    def test_author_factors(self):
        assert AUTHOR_ROLE_FACTOR["first_author"] == 1.0
        assert AUTHOR_ROLE_FACTOR["corresponding"] == 1.0
        assert AUTHOR_ROLE_FACTOR["co_author"] == 0.5
