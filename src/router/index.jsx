import { createBrowserRouter } from "react-router-dom";
import Layout        from "../components/layout/Layout";
import Home          from "../pages/Home";
import Detail        from "../pages/Detail";
import MyPage        from "../pages/MyPage";
import Search        from "../pages/Search";
import Category      from "../pages/Category";
import ProjectList   from "../pages/ProjectList";
import Login         from "../pages/Login";
import CreateProject from "../pages/CreateProject";
import EditProject   from "../pages/EditProject";
import EditProfile   from "../pages/EditProfile";
import OAuthSuccess  from "../pages/OAuthSuccess";
import UserProfile   from "../pages/UserProfile";
import Admin         from "../pages/Admin";
import NotFound      from "../pages/NotFound";

const router = createBrowserRouter([
  /* ── 일반 페이지 (헤더/푸터 있음) ── */
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true,             element: <Home /> },
      { path: "projects/:id",    element: <Detail /> },
      { path: "project/new",         element: <CreateProject /> },
      { path: "projects/:id/edit",   element: <EditProject /> },
      { path: "mypage",              element: <MyPage /> },
      { path: "mypage/edit",         element: <EditProfile /> },
      { path: "search",          element: <Search /> },
      { path: "category/:slug",  element: <Category /> },
      { path: "popular",         element: <ProjectList title="인기 프로젝트" /> },
      { path: "new",             element: <ProjectList title="신규 프로젝트" /> },
      { path: "closing-soon",    element: <ProjectList title="마감임박" /> },
      { path: "upcoming",        element: <ProjectList title="공개예정" /> },
      { path: "login",           element: <Login /> },
      { path: "reset-password",  element: <Login /> },
      { path: "oauth/success",   element: <OAuthSuccess /> },
      { path: "users/:userId",   element: <UserProfile /> },
      { path: "*",               element: <NotFound /> },
    ],
  },
  /* ── 관리자 페이지 (헤더/푸터 없음, 독립 레이아웃) ── */
  {
    path: "/admin",
    element: <Admin />,
  },
]);

export default router;
