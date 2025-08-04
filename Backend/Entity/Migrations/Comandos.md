# migraciones metase al web para ejecutar migraciones
dotnet ef migrations add InitialCreate --project ../Entity/ --startup-project .
# Aplicar la migración y crear la base de datos en MySQL/MariaDB.
dotnet ef database update --project ../Entity/ --startup-project .
# Dotnet ef
dotnet tool install --global dotnet-ef

# estructura de la base de datos
