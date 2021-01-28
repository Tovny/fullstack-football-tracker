import "./DateCarousel.scss";
import { useState, useEffect, useRef } from "react";
import moment from "moment";
//import ArrowBack from "@material-ui/icons/ArrowBackIosOutlined";
//import ArrowForward from "@material-ui/icons/ArrowForwardIosOutlined";
import CalendarTodaySharpIcon from "@material-ui/icons/CalendarTodaySharp";
import DateFnsUtils from "@date-io/date-fns";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { CSSTransition } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../redux/actions/filter-actions";

moment.updateLocale("en", {
  calendar: {
    lastDay: "[Yesterday]",
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    lastWeek: "ddd, MMM Do",
    nextWeek: "ddd, MMM Do",
    sameElse: "ddd, MMM Do",
  },
});

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

  const handleCalendarOpen = () => {
    console.log(openCalendar);
    setOpenCalendar(false);
    console.log(openCalendar);
  };

  useEffect(() => {
    (async () => {
      if (openCalendar) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
        window.addEventListener("click", handleCalendarOpen);
      } else {
        window.removeEventListener("click", handleCalendarOpen);
      }
    })();
  }, [openCalendar]);

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
  };

  const disableScroll = (e) => e.preventDefault();

  return (
    <div className="datePickerContainer">
      <div
        ref={dateSliderRef}
        className="dateCarousel"
        onWheel={(event) => {
          dateSliderRef.current.scrollLeft =
            dateSliderRef.current.scrollLeft + event.deltaY / 3;
        }}
        onMouseEnter={() => {
          window.addEventListener("wheel", disableScroll, {
            passive: false,
          });
        }}
        onMouseLeave={() =>
          window.removeEventListener("wheel", disableScroll, {
            passive: false,
          })
        }
      >
        <ul>{createDateSelectors()}</ul>
      </div>
      <div className="calendarContainer">
        <CalendarTodaySharpIcon
          onClick={() => setOpenCalendar(!openCalendar)}
        />
        <CSSTransition
          in={openCalendar}
          timeout={250}
          unmountOnExit
          mountOnEnter
        >
          <div className="calendar">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                variant="static"
                disableToolbar
                value={date}
                onChange={handleCalendarChange}
              />
            </MuiPickersUtilsProvider>
            <button
              id="todayButton"
              onClick={() => {
                const today = new Date();
                dispatch(setFilters({ date: today }));
                setOpenCalendar(false);
              }}
            >
              Today
            </button>
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
      {moment(selectorDate).calendar()}
    </li>
  ) : null;
};

export default DateCarousel;
