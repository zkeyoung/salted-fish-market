import Login from '../view/login';
import Register from '../view/register';
import { Routes, Route } from 'react-router-dom';
import Homepage from '../view/homepage';
import Layout from '../layouts';
import Message from '../view/message';
import PersonCenter from '../view/person-center';
import Constans from '../lib/constans';
import Shopbag from '../view/shopbag';
import PublishGood from '../view/publish-good';
import GoodDetail from '../view/good-detail';
import Chat from '../view/chat';
import ModifyProfile from '../view/person-center/modify-profile';

const routes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/goods/:id',
    element: <GoodDetail />
  },
  {
    path: '/chat/:sessionId',
    element: <Chat />,
    roles: ['member'],
  },
  {
    path: '/person-center/modify-profile',
    element: <ModifyProfile />,
    roles: ['member'],
  },
  {
    path: '/',
    element: <Layout />,
    isTabBar: true,
    children: [
      {
        title: Constans.TabBarTitle.Homepage,
        path: '',
        element: <Homepage />,
      },
      {
        title: Constans.TabBarTitle.Shopbag,
        path: 'shop-bag',
        element: <Shopbag />,
        roles: ['member'],
      },
      {
        title: Constans.TabBarTitle.Publish,
        path: 'publish',
        element: <PublishGood />,
        roles: ['member'],
      },
      {
        title: Constans.TabBarTitle.Message,
        path: 'message',
        element: <Message />,
        roles: ['member'],
      },
      {
        title: Constans.TabBarTitle.PersonCenter,
        path: 'person-center',
        element: <PersonCenter />,
        roles: ['member'],
      },
    ]
  },
]

function readerRoutes(routes) {
  return routes.map((route, index) => {
    return <Route path={route.path} element={route.element} key={index} children={route.children && route.children.length ? readerRoutes(route.children) : []} a={1} />
  });
}

const TabBarRoute = routes.find(route => route.isTabBar);
export const TabBarRoutes = TabBarRoute.children.map(route => ({ title: route.title, path: TabBarRoute.path + route.path }));

export const RouterRole = routes.reduce((routerRole, router) => {
  if (!router.children) {
    if (router.roles) {
      routerRole[router.path] = router.roles;
    }
  } else {
    router.children.forEach(childrenRouter => {
      if (childrenRouter.roles) {
        routerRole[router.path + childrenRouter.path] = childrenRouter.roles;
      }
    });
  }
  return routerRole;
}, {});

export default function RouteList() {
  return (
    <Routes>
      {readerRoutes(routes)}
    </Routes>
  )
}