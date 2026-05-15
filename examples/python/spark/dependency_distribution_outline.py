from dataclasses import dataclass


@dataclass
class DependencyPath:
    uri_scheme: str
    distributor: str
    worker_requirement: str


def resolve_distribution(uri_scheme: str) -> DependencyPath:
    if uri_scheme == "file":
        return DependencyPath(
            uri_scheme="file",
            distributor="driver_http_file_server",
            worker_requirement="executors_pull_from_driver",
        )
    if uri_scheme == "local":
        return DependencyPath(
            uri_scheme="local",
            distributor="none",
            worker_requirement="file_must_exist_on_every_worker",
        )
    return DependencyPath(
        uri_scheme=uri_scheme,
        distributor="remote_uri_source",
        worker_requirement="workers_fetch_from_remote_source",
    )


def python_dependency_channel() -> str:
    return "--py-files_for_py_zip_egg_distribution"


if __name__ == "__main__":
    print(resolve_distribution("file"))
    print(resolve_distribution("local"))
    print(python_dependency_channel())
