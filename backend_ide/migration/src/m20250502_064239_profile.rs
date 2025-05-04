use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Profile::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Profile::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Profile::Email).string_len(255).unique_key())
                    .col(ColumnDef::new(Profile::Name).string_len(255).unique_key())
                    .col(ColumnDef::new(Profile::Avatar).string().null())
                    .col(ColumnDef::new(Profile::Provider).string_len(255).null())
                    .col(ColumnDef::new(Profile::DockerContainerId).string().null())
                    .col(
                        ColumnDef::new(Profile::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Profile::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
pub enum Profile {
    Table,
    Id,
    Email,
    Name,
    Avatar,
    Provider,
    DockerContainerId,
    CreatedAt,
}
