import "./DateCarousel.scss";
import { useState, useEffect, useRef } from "react";
//import ArrowBack from "@material-ui/icons/ArrowBackIosOutlined";
//import ArrowForward from "@material-ui/icons/ArrowForwardIosOutlined";
import CalendarTodaySharpIcon from "@material-ui/icons/CalendarTodaySharp";
import { CSSTransition } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../redux/actions/filter-actions";
import { enGB } from "date-fns/locale";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { DatePickerCalendar } from "react-nice-dates";
import "react-nice-dates/src/style.scss";

const formatDate = (date) => {
  if (isToday(date)) {
    return format(date, "'Today'");
  } else if (isTomorrow(date)) {
    return format(date, "'Tomorrow'");
  } else if (isYesterday(date)) {
    return format(date, "'Yesterday'");
  } else {
    return format(date, "iii, LLL do");
  }
};

const DateCarousel = (props) => {
  const dispatch = useDispatch();
  const { date } = useSelector((state) => state.filters);
  const [carouselDate, setCarouselDate] = useState(new Date());
  const dateSliderRef = useRef(null);
  const selectedDate = document.getElementById("selectedDate");
  const [openCalendar, setOpenCalendar] = useState(false);

  useEffect(() => {
    if (document.getElementById("selectedDate"))
      document.getElementById("selectedDate").scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
  }, [selectedDate, date]);

  useEffect(() => {
    if (date === "all") {
      if (document.getElementById("selectedDate")) {
        document.getElementById("selectedDate").removeAttribute("id");
      }
    }
  }, [date]);

  useEffect(() => {
    window.addEventListener("click", () => setOpenCalendar(false));
  }, []);

  const createDateSelectors = () => {
    const dateSelectors = [];
    for (let i = -15; i <= 15; i++) {
      dateSelectors.push(
        <DateSelector
          carouselDate={carouselDate}
          date={date}
          multiplier={i}
          dispatch={dispatch}
          setDirection={props.setDirection}
          key={i}
        />
      );
    }
    return dateSelectors;
  };

  const handleCalendarChange = async (calendarDate) => {
    let direction;
    if (calendarDate > date) {
      direction = "Right";
    } else {
      direction = "Left";
    }

    await new Promise((res) => {
      props.setDirection(`fixturesTransition${direction}`);
      res();
    });

    dispatch(setFilters({ date: calendarDate }));
    setCarouselDate(calendarDate);
    setOpenCalendar(false);
  };

  return (
    <div className="datePickerContainer">
      <div
        ref={dateSliderRef}
        className="dateCarousel"
        onWheel={(event) => {
          event.preventDefault();
          event.nativeEvent.stopImmediatePropagation();
          event.stopPropagation();
          dateSliderRef.current.scrollLeft =
            dateSliderRef.current.scrollLeft + event.deltaY / 3;
        }}
      >
        <ul>{createDateSelectors()}</ul>
      </div>
      <div className="calendarContainer">
        <CalendarTodaySharpIcon
          onClick={(event) => {
            event.stopPropagation();
            event.nativeEvent.stopImmediatePropagation();
            setOpenCalendar(!openCalendar);
          }}
          color={openCalendar ? "secondary" : "action"}
          style={{ transition: "all .2s" }}
        />
        <CSSTransition
          in={openCalendar}
          timeout={250}
          className="calendar"
          mountOnEnter
          unmountOnExit
        >
          <div
            onClick={(event) => {
              event.stopPropagation();
              event.nativeEvent.stopImmediatePropagation();
            }}
          >
            <DatePickerCalendar
              locale={enGB}
              date={date !== "all" ? date : new Date()}
              onDateChange={handleCalendarChange}
            />
            <div className="calendarButtons">
              <button onClick={() => handleCalendarChange(new Date())}>
                Today
              </button>
              <button onClick={() => setOpenCalendar(false)}>Close</button>
            </div>
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};

const DateSelector = (props) => {
  const [selectorDate, setSelectorDate] = useState();

  useEffect(() => {
    const selectorDate = new Date(props.carouselDate);
    selectorDate.setDate(selectorDate.getDate() + props.multiplier);
    setSelectorDate(selectorDate);
  }, [props.carouselDate, props.multiplier]);

  const handleClick = async () => {
    let direction;
    if (selectorDate > props.date) {
      direction = "Right";
    } else {
      direction = "Left";
    }

    await new Promise((res) => {
      props.setDirection(`fixturesTransition${direction}`);
      res();
    });

    props.dispatch(setFilters({ date: selectorDate }));
  };

  return selectorDate ? (
    <li
      onClick={handleClick}
      id={
        props.date !== "all"
          ? props.date.toDateString() === selectorDate.toDateString()
            ? "selectedDate"
            : null
          : null
      }
    >
      {formatDate(selectorDate)}
    </li>
  ) : null;
};

export default DateCarousel;
