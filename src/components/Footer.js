import { Col, Row } from "react-bootstrap";
import "./Footer.css";
import VidaLogo from "../assets/images/vida-logo.png";
import Cxl from "./Col";
import Rxw from "./Row";
import Spacer from "./Spacer";
import SocialMedias from "./SocialMedias";
import Divider from "./Divider";
import { useState, useEffect } from "react";

export default function Footer() {
  const [hasScrolledPastThreshold, setHasScrolledPastThreshold] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight && !hasScrolledPastThreshold) {
        setHasScrolledPastThreshold(true);
      } else if (
        window.scrollY <= window.innerHeight &&
        hasScrolledPastThreshold
      ) {
        setHasScrolledPastThreshold(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasScrolledPastThreshold]);

  return (
    <div
      className={`footer ${
        hasScrolledPastThreshold ? "z-upper-layer" : "z-lower-layer"
      }`}
    >
      <Row className="w-100 g-0">
        <Col className="footer-vida-desc" lg={4}>
          <Row className="w-100 g-0 d-flex align-items-center">
            <Col lg={4}>
              <Cxl className={"align-items-center"}>
                <img src={VidaLogo} alt="vidaLogo" />
                <Spacer height={10} />
                <h3>ویدا</h3>
              </Cxl>
            </Col>
            <Col lg={8}>
              <p>
                شرکت تولیدی و صنعتی ویدا از سال ۱۳۹۸ فعالیت خود را با تمرکز بر
                طراحی و تولید سیستم‌های پیشرفته اکسس کنترل و راهکارهای نوین
                کنترل و نظارت از راه دور آغاز نمود. ویدا با تکیه بر تخصص و
                نوآوری، موفق شده است محصولات خود را در سراسر کشور به مشتریان
                گرامی عرضه کرده و اعتماد آن‌ها را جلب نماید
              </p>
            </Col>
          </Row>
        </Col>
        <Col lg={8}>
          <Row className="footer-general-desc g-0">
            <Col lg={4} className="gen-desc-col">
              <Cxl className={"align-items-center"}>
                <h4>تماس با ما</h4>
                <Divider color="white" />
                <Rxw className={"w-100 justify-content-between"}>
                  <p>کارخانه:</p>
                  <p style={{ fontSize: 12 }}>
                    کیلومتر 5 جاده خمین ، پارک علم و فناوری ، ساختمان نواوران ،
                    طبقه دوم ، اتاق 212
                  </p>
                </Rxw>
                <Rxw className={"w-100 justify-content-between"}>
                  <p>دفتر مرکزی:</p>
                  <p style={{ fontSize: 12 }}>
                  اراک، بلوار سردشت، کوچه فهیم، روبه روی نمایندگی تراکتور ولی يی
                  </p>
                </Rxw>
                <Rxw className={"w-100 justify-content-between"}>
                  <p>شماره تماس:</p>
                  <p>09129388020</p>
                </Rxw>
              </Cxl>
            </Col>
            <Col lg={4} className="gen-desc-col">
              <Cxl className={"align-items-center"}>
                <h4>شبکه های اجتماعی</h4>
                <Divider color="white" />
                <div className="bg-white w-100">
                  <SocialMedias />
                </div>
              </Cxl>
            </Col>
            <Col
              lg={4}
              className="gen-desc-col d-flex align-items-center justify-content-center"
            >
              <div>
                <a
                  referrerPolicy="origin"
                  target="_blank"
                  href="https://trustseal.enamad.ir/?id=616541&Code=Fg0pb0ESCCMjDgFAC9lR93ImiWew69sU"
                >
                  <img
                    referrerPolicy="origin"
                    src="https://trustseal.enamad.ir/logo.aspx?id=616541&Code=Fg0pb0ESCCMjDgFAC9lR93ImiWew69sU"
                    alt=""
                    style={{ cursor: "pointer" }}
                    code="Fg0pb0ESCCMjDgFAC9lR93ImiWew69sU"
                  />
                </a>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
