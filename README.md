## Hướng dẫn chạy dự án

### Bước 1: Cài docker nếu chưa cài

https://www.docker.com/

### Bước 2: Khởi chạy docker-compose để cài database Postgres

```shell tới thư mục của project rồi chạy lệnh dưới:
$ docker-compose up
```

Ngoài ra có thể tự cài database Postgres lên máy tính thì bỏ qua bước 1 và 2.

### Bước 3: copy file .env.example sang .env

```shell
$ cp .env.example .env
```

### Bước 4: Install dependencies. Nếu chưa cài thì chạy lệnh này để cài yarn: npm install -g yarn

```bash
$ yarn
```

### Bước 5: Chạy migrations để tạo database

```shell
$ npm run dbm:run
```

Mỗi khi có thay đổi hoặc thêm entity thì phải chạy lệnh generate để tạo thêm file migrations bằng lệnh dưới đây:

```shell
$ npm run dbm:generate --name=MigrationName
```

Sau khi chạy xong lại lại lênh npm run dbm:run để cập nhật thay đổi lên database

### Bước 6: Chạy app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
