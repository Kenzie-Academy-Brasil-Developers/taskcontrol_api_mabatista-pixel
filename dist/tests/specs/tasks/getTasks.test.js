"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const prisma_1 = require("../../../database/prisma");
const category_mocks_1 = require("../../mocks/category.mocks");
const tasks_mocks_1 = require("../../mocks/tasks.mocks");
const user_mocks_1 = require("../../mocks/user.mocks");
const setupFiles_1 = require("../../setupFiles");
const categoryDefaultExpects_1 = require("../../utils/categoryDefaultExpects");
const generateAuthentication_1 = require("../../utils/generateAuthentication");
const taskDefaultExpects_1 = require("../../utils/taskDefaultExpects");
const getTasksBeforeEach = () => __awaiter(void 0, void 0, void 0, function* () {
    const { user: user1, token: token1 } = yield (0, generateAuthentication_1.generateAuthentication)();
    yield prisma_1.prisma.category.create({ data: (0, category_mocks_1.category)(user1.id) });
    const taskList = yield (0, tasks_mocks_1.getTaskList)(user1.id);
    yield prisma_1.prisma.task.createMany({ data: taskList });
    const { user: user2, token: token2 } = yield (0, generateAuthentication_1.generateAuthentication)(user_mocks_1.secondUserMock);
    yield prisma_1.prisma.task.create({ data: Object.assign(Object.assign({}, tasks_mocks_1.task), { userId: user2.id }) });
    return { user: user1, token: token1, secondUser: user2, secondToken: user2 };
});
(0, vitest_1.describe)("get tasks", () => {
    (0, vitest_1.it)("should be able to get tasks successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const { user, token } = yield getTasksBeforeEach();
        const data = yield setupFiles_1.request
            .get("/tasks")
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .then((response) => response.body);
        (0, vitest_1.expect)(data).toHaveLength(2);
        (0, taskDefaultExpects_1.taskDefaultExpects)(data[0], user.id);
        (0, vitest_1.expect)(data[0].category).toBeNull();
        (0, taskDefaultExpects_1.taskDefaultExpects)(data[1], user.id);
        (0, categoryDefaultExpects_1.categoryDefaultExpects)(data[1].category);
    }));
    (0, vitest_1.it)("should be able to get tasks from specific category", () => __awaiter(void 0, void 0, void 0, function* () {
        const { user, token } = yield getTasksBeforeEach();
        const getCategory = yield prisma_1.prisma.category.findFirst();
        const data = yield setupFiles_1.request
            .get(`/tasks?category=${getCategory === null || getCategory === void 0 ? void 0 : getCategory.name}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .then((response) => response.body);
        (0, vitest_1.expect)(data).toHaveLength(1);
        (0, taskDefaultExpects_1.taskDefaultExpects)(data[0], user.id);
        (0, categoryDefaultExpects_1.categoryDefaultExpects)(data[0].category);
    }));
    (0, vitest_1.it)("should throw error when try to get tasks from a category of a different user", () => __awaiter(void 0, void 0, void 0, function* () {
        const { secondToken } = yield getTasksBeforeEach();
        const getCategory = yield prisma_1.prisma.category.findFirst();
        yield setupFiles_1.request
            .get(`/tasks?category=${getCategory === null || getCategory === void 0 ? void 0 : getCategory.id}`)
            .set("Authorization", `Bearer ${secondToken}`)
            .expect(401)
            .then((response) => response.body);
    }));
    (0, vitest_1.it)("should throw error when there is no token", () => __awaiter(void 0, void 0, void 0, function* () {
        yield setupFiles_1.request.get("/tasks").expect(401);
    }));
    (0, vitest_1.it)("should throw error when the token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        const token = (0, generateAuthentication_1.generateInvalidToken)();
        yield setupFiles_1.request
            .get("/tasks")
            .set("Authorization", `Bearer ${token}`)
            .expect(401);
    }));
    (0, vitest_1.it)("should be able to get a single task by the id correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const { user, token } = yield getTasksBeforeEach();
        const tasks = yield prisma_1.prisma.task.findMany();
        const data = yield setupFiles_1.request
            .get(`/tasks/${tasks[1].id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .then((response) => response.body);
        (0, taskDefaultExpects_1.taskDefaultExpects)(data, user.id);
        (0, categoryDefaultExpects_1.categoryDefaultExpects)(data.category);
    }));
    (0, vitest_1.it)("should be throw error when try get a task with a invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const { token } = yield getTasksBeforeEach();
        const tasks = yield prisma_1.prisma.task.findMany();
        const id = tasks[2].id + 1;
        yield setupFiles_1.request
            .get(`/tasks/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    }));
    (0, vitest_1.it)("should not be able to get a task from a different user", () => __awaiter(void 0, void 0, void 0, function* () {
        const { secondToken } = yield getTasksBeforeEach();
        const tasks = yield prisma_1.prisma.task.findMany();
        yield setupFiles_1.request
            .get(`/tasks/${tasks[0].id}`)
            .set("Authorization", `Bearer ${secondToken}`)
            .expect(401);
    }));
    (0, vitest_1.it)("should throw error when there is no token", () => __awaiter(void 0, void 0, void 0, function* () {
        yield setupFiles_1.request.get("/tasks/1").expect(401);
    }));
    (0, vitest_1.it)("should throw error when the token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
        const token = (0, generateAuthentication_1.generateInvalidToken)();
        yield setupFiles_1.request
            .get("/tasks/1")
            .set("Authorization", `Bearer ${token}`)
            .expect(401);
    }));
});
