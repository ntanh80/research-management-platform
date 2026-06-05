from enum import Enum


class PhdStudentStatus(str, Enum):
    STUDYING = "STUDYING"
    LEAVE = "LEAVE"
    EXTENDED = "EXTENDED"
    DEFENDED = "DEFENDED"
    DROPPED = "DROPPED"


class ProjectStatus(str, Enum):
    PROPOSED = "PROPOSED"
    APPROVED = "APPROVED"
    IN_PROGRESS = "IN_PROGRESS"
    OVERDUE = "OVERDUE"
    ACCEPTED = "ACCEPTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PublicationType(str, Enum):
    JOURNAL_ARTICLE = "JOURNAL_ARTICLE"
    CONFERENCE_PAPER = "CONFERENCE_PAPER"
    BOOK = "BOOK"
    BOOK_CHAPTER = "BOOK_CHAPTER"
    PATENT = "PATENT"
    OTHER = "OTHER"


class SupervisorRole(str, Enum):
    CHINH = "CHINH"
    PHU = "PHU"


class AuthorType(str, Enum):
    LECTURER = "LECTURER"
    PHD_STUDENT = "PHD_STUDENT"
    EXTERNAL = "EXTERNAL"


class IndexType(str, Enum):
    ISI = "ISI"
    SCIE = "SCIE"
    ESCI = "ESCI"
    SCOPUS = "SCOPUS"
    DOMESTIC = "DOMESTIC"
    OTHER = "OTHER"


class Quartile(str, Enum):
    Q1 = "Q1"
    Q2 = "Q2"
    Q3 = "Q3"
    Q4 = "Q4"


class AuditAction(str, Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    IMPORT = "IMPORT"
    EXPORT = "EXPORT"
    BACKUP = "BACKUP"
    RESTORE = "RESTORE"
    PERMISSION_CHANGE = "PERMISSION_CHANGE"


VALID_TRANSITIONS = {
    PhdStudentStatus.STUDYING: [
        PhdStudentStatus.LEAVE,
        PhdStudentStatus.EXTENDED,
        PhdStudentStatus.DEFENDED,
        PhdStudentStatus.DROPPED,
    ],
    PhdStudentStatus.LEAVE: [
        PhdStudentStatus.STUDYING,
        PhdStudentStatus.DROPPED,
    ],
    PhdStudentStatus.EXTENDED: [
        PhdStudentStatus.DEFENDED,
        PhdStudentStatus.DROPPED,
    ],
    PhdStudentStatus.DEFENDED: [],
    PhdStudentStatus.DROPPED: [],
}

SCORING = {
    "ISI": {"Q1": 10, "Q2": 8, "Q3": 6, "Q4": 4},
    "SCOPUS": {"Q1": 8, "Q2": 6, "Q3": 4, "Q4": 2},
}

AUTHOR_ROLE_FACTOR = {
    "first_author": 1.0,
    "corresponding": 1.0,
    "co_author": 0.5,
}
