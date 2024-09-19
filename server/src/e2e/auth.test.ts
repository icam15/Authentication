import App from "../app";
import supertest from "supertest";
import { UserTest } from "./utils";
import { logger } from "../libs/logging";

const test = new App();

// 1. REGISTER
describe("POST /api/auth/register", () => {
  afterEach(async () => {
    await UserTest.deleteUserTest();
  });
  it("Should be able to register user", async () => {
    const response = await supertest(test.app).post("/api/auth/register").send({
      username: "test",
      email: "bianskiza@gmail.com",
      password: "testtest",
    });

    console.log(response.body);
    expect(response.status).toBe(201);
  });
});

// 2. LOGIN
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await UserTest.createUserTest();
  });

  afterEach(async () => {
    await UserTest.deleteUserTest();
  });

  it("Should be able login user", async () => {
    const response = await supertest(test.app).post("/api/auth/login").send({
      email: "bianskiza@gmail.com",
      password: "testtest",
    });

    console.log(response.headers);
    console.log(response.body);
    expect(response.status).toBe(201);
  });
});

// 3. VERIFY ACCOUNT
describe("POST /api/auth/verify-account", () => {
  beforeEach(async () => {
    await UserTest.createUserTest();
  });

  afterEach(async () => {
    await UserTest.deleteUserTest();
  });

  it("Should be able to verify account", async () => {
    const response = await supertest(test.app)
      .post("/api/auth/verify-account")
      .send({
        token: "123456",
      });

    console.log(response.body);
    expect(response.status).toBe(201);
  });
});

// On this step

// 4. SESSION
describe.only("GET /api/auth/session", () => {
  beforeEach(async () => {
    await UserTest.createUserTest();
  });

  afterEach(async () => {
    await UserTest.deleteUserTest();
  });

  // let user;

  it("Should login test", async () => {
    const response = await supertest(test.app).post("/api/auth/login").send({
      email: "bianskiza@gmail.com",
      password: "testtest",
    });
    logger.debug(response.error);
    console.log(response.header);
    expect(response.status).toBe(201);
  });

  it("Should be able to get session user", async () => {
    const response = await supertest(test.app).get("/api/auth/session");

    logger.debug(response);
    expect(response.status).toBe(201);
  });
});

// 5. LOGOUT
describe("GET /api/auth/logout", () => {
  it("Should logout user", async () => {
    const response = await supertest(test.app).get("/api/auth/logout");

    expect(response.status).toBe(201);
  });
});

// 6. FORGOT PASSWORD
describe("POST /api/auth/forgot-password", () => {
  it("Should send token reset password", async () => {
    const response = await supertest(test.app)
      .post("/api/auth/forgot-password")
      .send({
        email: "bianskiza@gmail.com",
      });

    expect(response.status).toBe(201);
  });
});

// 7. RESET PASSWORD
describe("POST /api/auth/reset-password/:resetPasswordToken", () => {
  it("Should reset password user", async () => {
    const response = await supertest(test.app).post("/api/auth/reset-password");
  });
});
