# migraciones metase al web para ejecutar migraciones
dotnet ef migrations add InitialCreate --project ../Entity/ --startup-project .
# Aplicar la migración y crear la base de datos en MySQL/MariaDB.
dotnet ef database update --project ../Entity/ --startup-project .

# estructura de la base de datos
