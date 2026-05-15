from dataclasses import dataclass


@dataclass
class ResultSurface:
    api: str
    driver_memory_boundary: str
    recomputation_risk: str


def choose_result_surface(api: str) -> ResultSurface:
    if api == "collect":
        return ResultSurface(
            api="collect",
            driver_memory_boundary="all_rows",
            recomputation_risk="low_once_triggered",
        )
    if api == "toLocalIterator":
        return ResultSurface(
            api="toLocalIterator",
            driver_memory_boundary="largest_partition",
            recomputation_risk="multiple_jobs_cache_if_wide",
        )
    return ResultSurface(
        api="take",
        driver_memory_boundary="requested_n_rows",
        recomputation_risk="bounded_by_requested_rows",
    )


if __name__ == "__main__":
    print(choose_result_surface("collect"))
    print(choose_result_surface("toLocalIterator"))
    print(choose_result_surface("take"))
