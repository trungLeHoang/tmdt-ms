import React, {useState, useEffect} from "react";
import "./OrderPage.css";
import { useHistory } from "react-router";
import {app} from "../../firebase";
import {getFirestore, doc, getDoc}from "firebase/firestore";
import {onAuthStateChanged, getAuth} from "firebase/auth";
import UserNavbar from "../../components/NavBar/UserNavbar";
import AdminNavbar from "../../components/NavBar/AdminNavbar";
import qrcode from "./qrcode.jpg";
import Footer from "../../components/Footer/Footer";

export default function OrderPage (props) {
    let history = useHistory();
    const [navbar, setNavbar] = useState({bar: null})
    const [status, setStatus] = useState({orderID: null, amount: null, paymentMethod: null});

    const auth = getAuth(app);
    const userID = localStorage.getItem('userID');

    onAuthStateChanged(auth, (user)=>{
      if (user){}
      else {
        localStorage.clear();
        history.push({
          pathname: '/login',
          state: {msg: "Trước hết bạn cần đăng nhập."}
        });
      }
        
    });

    const db = getFirestore(app);
    const verifyAdmin = async () => {
      const userRef = doc(db, 'users', userID);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()){
        if (userSnap.data().type === "admin")
          setNavbar({bar: (<AdminNavbar/>)})
        else 
          setNavbar({bar: (<UserNavbar/>)})
      }
    }

    console.log(status);

    useEffect(() => {
      try{
        setStatus({
          orderID: props.location.state.orderID,
          amount: props.location.state.amount,
          paymentMethod: props.location.state.paymentMethod
        });
      } catch (error) {
        history.push("/");
      };
      if (userID) verifyAdmin();
    }, []);

    const backToHome = e => {
        history.push("/");
    }

    return (
    <div>
        {navbar.bar}
        <div className="order-container">
                {  status.paymentMethod === "cod" && (
                    <div className="card success">
                        <div className="order-img">
                            <i className="icon">✓</i>
                        </div>
                        <h1>Thành công</h1> 
                        <p>Đơn hàng của quý khách đã được tiếp nhận.<hr/></p>
                        <h1>Mã đơn hàng: <strong>{status.orderID}</strong></h1> <hr/>
                        <button onClick={backToHome}>Tiếp tục mua hàng</button>
                    </div>
                )}
                {  status.value === "error" && (
                    <div className="card error">
                        <div className="order-img">
                            <span>X</span>
                        </div>
                        <h1>Không thành công</h1> 
                        <p>Đã có lỗi xảy ra khi thanh toán.<hr/></p>
                        <button onClick={backToHome}>Tiếp tục mua hàng</button>
                    </div>
                )}
                {   status.paymentMethod !== "cod" && (
                    <div className="card accepted">
                        <div className="order-img">
                            <i className="icon">✓</i>
                        </div>
                        <h1>Đã tiếp nhận đơn hàng</h1> 
                        
                        <p>Đơn hàng của quý khách đã được tiếp nhận và chờ thanh toán.<hr/></p>
                        <h1>Mã đơn hàng: <strong>{status.orderID}</strong></h1> <hr/>
                        <p>
                            Khách hàng vui lòng chuyển số tiền tương ứng vào một trong những  <br/>
                            tài khoản ngân hàng (hoặc ví MoMo) dưới đây với nội dung là <strong>mã đơn hàng</strong>.
                        </p><br/>
                        <p className="amount-display">Số tiền cần thanh toán: 
                          <span className="amount-value">
                            {Number(status.amount).toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            })}
                          </span>
                        </p>
                        { status.paymentMethod === "banking" &&
                        <table className="bank-account">
                          <tbody>
                            <tr>
                              <th>Ngân hàng</th>
                              <th>Chi nhánh</th>
                              <th>STK</th>
                              <th>Tên chủ TK</th>
                            </tr>
                            <tr>
                              <td>OCB</td>
                              <td>Lý Thường Kiệt Q10 TPHCM</td>
                              <td>0004 1000 xxxx xxxx</td>
                              <td>NGUYEN HUU TRUONG</td>
                            </tr>
                          </tbody>
                        </table>
                        }
                        { status.paymentMethod === "momo" &&
                        <div>
                          <table className="bank-account">
                            <tbody>
                              <tr>
                                <th>Ví điện tử</th>
                                <th>SĐT</th>
                                <th>Tên chủ TK</th>
                              </tr>
                              <tr>
                                <td>MoMo</td>
                                <td>0333 446 xxx</td>
                                <td>NGUYEN HUU TRUONG</td>
                              </tr>
                            </tbody>
                          </table>
                          <img src={qrcode} alt="qrcode" width="300px"/>
                        </div>
                        
                        }
                        
                        <p><i>Nếu gặp sự cố, quý khách vui lòng liên hệ hotline <strong>1900 xxxx</strong> để được hỗ trợ.</i>
                            <br/><br/>  Cảm ơn quý khách đã lựa chọn sản phẩm của chúng tôi !
                        </p>
                        <button onClick={backToHome}>Tiếp tục mua hàng</button>
                    </div>
                )}

        </div>  
        <Footer/>
    </div>
    );
}