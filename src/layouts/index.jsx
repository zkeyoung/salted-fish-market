import Footer from "./footer";
import { Outlet } from 'react-router-dom';
import './index.css';


export default function Layout() {
  return (
    <div className="app">
      <div className="body">
        <Outlet />
      </div>
      <Footer className="bottom" />
    </div>
  );
}