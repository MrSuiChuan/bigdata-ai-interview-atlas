from confluent_kafka.admin import (
    AdminClient,
    AclBinding,
    AclOperation,
    AclPermissionType,
    ResourcePatternType,
    ResourceType,
)


BOOTSTRAP_SERVERS = "localhost:9092"
TOPIC_PREFIX = "tenantA.orders."
PRINCIPAL = "User:tenantA-app"


def build_admin() -> AdminClient:
    return AdminClient({"bootstrap.servers": BOOTSTRAP_SERVERS})


def main() -> None:
    admin = build_admin()

    # 给租户前缀统一授予写权限，后续新增同前缀 topic 时不必逐个再配 ACL。
    acl = AclBinding(
        ResourceType.TOPIC,
        TOPIC_PREFIX,
        ResourcePatternType.PREFIXED,
        PRINCIPAL,
        "*",
        AclOperation.WRITE,
        AclPermissionType.ALLOW,
    )

    futures = admin.create_acls([acl])
    for binding, future in futures.items():
        future.result()
        print(
            "created acl ",
            binding.principal,
            binding.operation,
            binding.name,
            binding.resource_pattern_type,
        )


if __name__ == "__main__":
    main()