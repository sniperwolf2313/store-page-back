# StorePage-Back

Este proyecto es el backend de una aplicación de pagos para una tienda, desarrollado con NestJS. Gestiona productos, procesamientos de pago mediante la API, y maneja datos de usuarios y transacciones.

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Documentación de la API](#documentación-de-la-api)
- [Pruebas](#pruebas)
- [Diseño del modelo de datos](#diseño-del-modelo-de-datos)

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [npm](https://www.npmjs.com/) (v6 o superior) o [Yarn](https://yarnpkg.com/)
- [NestJS CLI](https://docs.nestjs.com/cli/overview) (opcional, pero recomendado)
- Una cuenta en [AWS](https://aws.amazon.com/) para el uso de DynamoDB y S3.

## Instalación

Clona este repositorio y navega al directorio del proyecto:

```bash
git clone https://github.com/tu-usuario/storepage-back.git
cd storepage-back

```
### Instala las dependencias:

`npm install` o `yarn install`


## Configuración

Configura las variables de entorno. Crea un archivo .env en la raíz del proyecto y añade las siguientes variables:
```
PORT=
API_URL=
PUBLIC_KEY=
PRIVATE_KEY=
EVENTS_KEY=
INTEGRITY_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
```

## Ejecución

Para ejecutar el servidor en modo de desarrollo:
```bash
npm run start:dev
# o
yarn start:dev
```
El servidor estará disponible en http://localhost:3000.

## Estructura del proyecto
esternocleidomastoideo 

## Scripts disponibles
Los siguientes scripts están disponibles en el proyecto:

- `start`: Inicia el servidor en modo de producción.
- `start:dev`: Inicia el servidor en modo de desarrollo con recarga en caliente.
- `start:debug`: Inicia el servidor en modo de depuración.
- `test`: Ejecuta todas las pruebas.
- `test:watch`: Ejecuta las pruebas en modo observador.
- `test:cov`: Genera un reporte de cobertura de pruebas.
- `lint`: Ejecuta el linter para el código fuente.

## Documentación de la API
### Importar la Colección en Postman

1. **Link para descargar la colección:**
- [Descarga Aqui 'ENDPOINTS STOREPAGE'](https://drive.google.com/file/d/1D7ttKkRLVFJK3c51pxbGSuAmWvioZzGV/view?usp=sharing)

## Pruebas

## Diseño del modelo de datos

### Products:

La tabla `Products` almacena la información de los productos disponibles en la tienda. A continuación se describen los campos de esta tabla:

| **Campo**        | **Tipo de Dato** | **Descripción**                                     |
|------------------|------------------|-----------------------------------------------------|
| `productId`      | String           | Identificador único del producto.                   |
| `productName`    | String           | Nombre del producto.                                |
| `price`          | Number           | Precio del producto.                                |
| `description`    | String           | Descripción del producto.                           |
| `stock`          | Number           | Cantidad de producto disponible en inventario.      |
| `imageURL`       | String           | URL de la imagen del producto (almacenada en S3).   |

### Customers:

La tabla `Customers` almacena la información de los clientes que utilizan la tienda. A continuación se describen los campos de esta tabla:

| **Campo**           | **Tipo de Dato** | **Descripción**                                      |
|---------------------|------------------|------------------------------------------------------|
| `customerId`        | String           | Identificador único del cliente.                     |
| `idType`            | String           | Tipo de identificación del cliente (por ejemplo, DNI, pasaporte). |
| `name`              | String           | Nombre completo del cliente.                         |
| `email`             | String           | Correo electrónico del cliente.                      |
| `phone_number`      | String           | Número de teléfono del cliente.                      |
| `deliveryAddress`   | String           | Dirección de entrega del cliente.                    |

### Delivery:

La tabla `Deliveries` almacena la información de las entregas de productos a los clientes. A continuación se describen los campos de esta tabla:

| **Campo**        | **Tipo de Dato** | **Descripción**                                      |
|------------------|------------------|------------------------------------------------------|
| `deliveryId`     | String           | Identificador único de la entrega.                   |
| `shippingData`   | Any              | Datos de envío, puede incluir detalles como el transportista, tiempo estimado de entrega, etc. |
| `status`         | String           | Estado de la entrega (por ejemplo, pendiente, en tránsito, entregado, cancelado). |


### Transaction:

La tabla `Transactions` almacena la información de las transacciones realizadas por los clientes en la tienda. A continuación se describen los campos de esta tabla:

| **Campo**         | **Tipo de Dato** | **Descripción**                                      |
|-------------------|------------------|------------------------------------------------------|
| `transactionId`   | String           | Identificador único de la transacción.               |
| `reference`       | String           | Referencia de la transacción (por ejemplo, número de orden). |
| `amountInCents`   | Number           | Monto de la transacción en centavos.                 |
| `currency`        | String           | Moneda utilizada en la transacción (por ejemplo, COP). |
| `customerId`      | Any              | Identificador del cliente que realizó la transacción. |
| `customerEmail`   | String           | Correo electrónico del cliente.                      |
| `paymentMethod`   | Any              | Método de pago utilizado (por ejemplo, tarjeta de crédito, transferencia bancaria). |
| `status`          | String           | Estado de la transacción (por ejemplo, pendiente, completada, fallida). |

### Uso de S3 para Almacenamiento de Imágenes
Las imágenes de los productos se almacenan en un bucket de S3. La URL de la imagen se guarda en la tabla de productos en DynamoDB.
