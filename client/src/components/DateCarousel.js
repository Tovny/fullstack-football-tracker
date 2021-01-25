import "./DateCarousel.scss";
import { useState, useEffect } from "react";
import moment from "moment";
import ArrowBack from "@material-ui/icons/ArrowBackIosOutlined";
import ArrowForward from "@material-ui/icons/ArrowForwardIosOutlined";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../redux/actions/filter-actions";

moment.updateLocale("en", {
  calendar: {
    lastDay: "[\nYesterday]",
    sameDay: "[\nToday]",
    nextDay: "[\nTomorrow]",
    lastWeek: "ddd,[\n] MMM Do",
    nextWeek: "ddd,[\n] MMM Do",
    sameElse: "ddd,[\n] MMM Do",
  },
});

const DateCarousel = (props) => {
  const dispatch = useDispatch();
  const { date } = useSelector((state) => state.filters);
  const [carouselDate, setCarouselDate] = useState(new Date());

  useEffect(() => {
    date === "all"
      ? setCarouselDate(new Date())
      : setCarouselDate(new Date(date));
  }, [date]);

  const createDateDiv = (multiplier = 0, direction = "Left") => {
    let idate;

    date === "all" ? (idate = new Date()) : (idate = new Date(date));

    idate.setDate(idate.getDate() + multiplier);

    const styleObj = { whiteSpace: "pre" };

    if (idate.getTime() === carouselDate.getTime()) {
      styleObj.borderBottom = ".15rem solid rgb(207, 72, 72)";
    } else {
      styleObj.borderBottom = ".15rem solid silver";
    }

    return (
      <div
        onClick={async () => {
          await new Promise((res) => {
            props.setDirection(`fixturesTransition${direction}`);
            res();
          });
          dispatch(setFilters({ date: idate }));
        }}
        style={styleObj}
      >
        {moment(idate).calendar()}
      </div>
    );
  };

  return (
    <div className="dateCarousel">
      <ArrowBack
        onClick={() => {
          setCarouselDate(
            new Date(carouselDate.setDate(carouselDate.getDate() - 7))
          );
        }}
      />
      {createDateDiv(-3)}
      {createDateDiv(-2)}
      {createDateDiv(-1)}
      {createDateDiv()}
      {createDateDiv(1, "Right")}
      {createDateDiv(2, "Right")}
      {createDateDiv(3, "Right")}
      <ArrowForward
        onClick={() => {
          setCarouselDate(
            new Date(carouselDate.setDate(carouselDate.getDate() + 7))
          );
        }}
      />
    </div>
  );
};

export default DateCarousel;
