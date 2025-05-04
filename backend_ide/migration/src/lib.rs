pub use sea_orm_migration::prelude::*;

mod m20250502_064153_email_verification;
mod m20250502_064222_user;
mod m20250502_064239_profile;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250502_064153_email_verification::Migration),
            Box::new(m20250502_064239_profile::Migration),
            Box::new(m20250502_064222_user::Migration),
        ]
    }
}
