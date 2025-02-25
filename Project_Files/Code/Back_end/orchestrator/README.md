# Spring Boot Project

## Steps to Get Started

1. **Download the entire Maven Spring Boot Project** [here](https://drive.google.com/file/d/1B15u2L4KT7uQgXKm9sBk3SDFdcagwKzQ/view?usp=sharing).
   
2. **Unzip the file**.

3. **Open the project** in your IDE using the `pom.xml` file.

4. **Start the MySQL Container in Docker**, run this command to start the MySQL Container:

```bash
docker run --name mysql-container -e MYSQL_ROOT_PASSWORD=my-secret-pw -e MYSQL_DATABASE=tdc-test -e MYSQL_USER=tdc-user -e MYSQL_PASSWORD=tdc-pw -p 3307:3306 -d mysql:8-oracle
```

5. **Update the database connection details** in `src/main/resources/application.properties` if required:

    ```properties
    spring.datasource.url=jdbc:mysql://host.docker.internal:3307/tdc-test
    spring.datasource.username=tdc-user
    spring.datasource.password=tdc-pw
    ```

6. **Run Maven clean install** to generate the JAR file:

    ```bash
    mvn clean install
    ```

The generated JAR file can then be used in Docker image creation.
