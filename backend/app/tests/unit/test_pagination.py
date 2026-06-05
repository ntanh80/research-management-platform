from app.common.pagination import PaginationParams, create_pagination


class TestPaginationParams:
    def test_default_values(self):
        p = PaginationParams()
        assert p.page == 1
        assert p.page_size == 20
        assert p.offset == 0
        assert p.limit == 20

    def test_custom_values(self):
        p = PaginationParams(page=3, page_size=50)
        assert p.page == 3
        assert p.offset == 100
        assert p.limit == 50

    def test_page_minimum(self):
        p = PaginationParams(page=0, page_size=20)
        assert p.page == 1

    def test_page_size_maximum(self):
        p = PaginationParams(page_size=500)
        assert p.page_size == 200

    def test_page_size_minimum(self):
        p = PaginationParams(page_size=0)
        assert p.page_size == 1


class TestCreatePagination:
    def test_basic(self):
        p = create_pagination(1, 20, 100)
        assert p.page == 1
        assert p.page_size == 20
        assert p.total == 100
        assert p.total_pages == 5
        assert p.has_next == True
        assert p.has_prev == False

    def test_last_page(self):
        p = create_pagination(5, 20, 100)
        assert p.has_next == False
        assert p.has_prev == True

    def test_empty(self):
        p = create_pagination(1, 20, 0)
        assert p.total == 0
        assert p.total_pages == 1
        assert p.has_next == False
        assert p.has_prev == False

    def test_single_page(self):
        p = create_pagination(1, 20, 5)
        assert p.total_pages == 1
        assert p.has_next == False
