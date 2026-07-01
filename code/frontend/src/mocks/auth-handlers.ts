import { http, HttpResponse } from "msw";

// interface User32 {
//   email: string;
//   password: string;
// }

// fake DB
// const users = [
//   { id: 1, email: "admin@test.com", password: "1234", role: "admin" },
// ];

// 🔐 LOGIN
const login = http.post("/api/v1/auth/login", async ({ 
  // request
 }) => {
  // const body = (await request.json()) as User32;

  // const user = users.find(
  //   (u) => u.email === body.email && u.password === body.password
  // );

  // // simulate delay
  // await new Promise((res) => setTimeout(res, 800));

  // if (!user) {
  //   return new HttpResponse(
  //     JSON.stringify({ message: "Invalid credentials" }),
  //     { status: 401 }
  //   );
  // }

  // return HttpResponse.json({
  //   token: "mock.jwt.token",
  //   user: {
  //     id: user.id,
  //     email: user.email,
  //     role: user.role,
  //   },
  // });

  return HttpResponse.json({
    token:
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiaWF0IjoxNzc1MjI4OTI2LCJleHAiOjE3ODM4Njg5MjZ9.GzGzr2_vf3zgVqt_irz7wE8wqxXSAWDKyrTqd2K8sgo",
    user: {
      id: 2,
      username: "user",
      role: "USER",
    },
  });
});

// 📊 DASHBOARD
const dashboard = http.get("/api/v1/dashboard", async () => {
  await new Promise((res) => setTimeout(res, 500));

  return HttpResponse.json({
    users: 120,
    sales: 540,
  });
});

export const handlers = [login, dashboard];
