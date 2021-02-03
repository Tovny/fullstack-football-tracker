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
import "react-nice-dates/build/style.css";

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
  const [carouselDate, setCarouselDate] = useState(new Date(date));
  const dateSliderRef = useRef(null);
  const selectedDate = document.getElementById("selectedDate");
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectorDates, setSelectorDates] = useState();

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
    const dateSelectors = [];
    for (let i = -7; i <= 7; i++) {
      const selectorDate = new Date(carouselDate);
      selectorDate.setDate(selectorDate.getDate() + i);

      dateSelectors.push(selectorDate);
    }

    setSelectorDates(dateSelectors);
  }, [carouselDate]);

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

  useEffect(() => {
    if (selectorDates)
      selectorDates.forEach((selectorDate, i) => {
        if (selectorDate === date) {
          if (selectorDates.length - i <= 7) {
            const newSelectors = [];
            for (let j = 7 - (selectorDates.length - i - 1); j >= 1; j--) {
              const newDateSelector = new Date(
                selectorDates[selectorDates.length - 1]
              );
              newDateSelector.setDate(newDateSelector.getDate() + j);
              newSelectors.unshift(newDateSelector);
            }
            setSelectorDates([...selectorDates, ...newSelectors]);
          } else if (i < 7) {
            const newSelectors = [];
            for (let j = 7 - i; j >= 1; j--) {
              const newDateSelector = new Date(selectorDates[0]);
              newDateSelector.setDate(newDateSelector.getDate() - j);
              newSelectors.push(newDateSelector);
            }
            setSelectorDates([...newSelectors, ...selectorDates]);
            if (selectedDate)
              dateSliderRef.current.scrollLeft =
                dateSliderRef.current.getBoundingClientRect().width +
                selectedDate.getBoundingClientRect().width / 2;
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    const elt = document.getElementsByClassName("nice-dates-navigation")[0];

    if (!document.getElementById("calendarToday")) {
      if (elt && openCalendar) {
        const childSpan = document.createElement("span");
        const textNode = document.createTextNode("Today");
        childSpan.appendChild(textNode);
        childSpan.id = "calendarToday";

        childSpan.addEventListener("click", () =>
          handleCalendarChange(new Date())
        );

        elt.appendChild(childSpan);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCalendar]);

  return (
    <div className="datePickerContainer">
      <div
        ref={dateSliderRef}
        className="dateCarousel"
        onWheel={(event) => {
          dateSliderRef.current.scrollLeft =
            dateSliderRef.current.scrollLeft + event.deltaY;
        }}
      >
        <ul>
          {selectorDates
            ? selectorDates.map((selectorDate, i) => (
                <DateSelector
                  date={date}
                  selectorDate={selectorDate}
                  dispatch={dispatch}
                  setDirection={props.setDirection}
                  key={i}
                />
              ))
            : null}
        </ul>
      </div>
      <CalendarTodaySharpIcon
        id="calendarIcon"
        onClick={() => {
          setOpenCalendar(!openCalendar);
        }}
        color={openCalendar ? "secondary" : "action"}
        style={{ transition: "all .2s" }}
      />
      <CSSTransition
        in={openCalendar}
        timeout={250}
        mountOnEnter
        unmountOnExit
        className="calendarModal"
        onClick={() => setOpenCalendar(false)}
      >
        <div>
          <div
            className="calendar"
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
            <div className="calendarButtons"></div>
          </div>
        </div>
      </CSSTransition>
    </div>
  );
};

const DateSelector = (props) => {
  const handleClick = async () => {
    let direction;
    if (props.selectorDate > props.date) {
      direction = "Right";
    } else {
      direction = "Left";
    }

    await new Promise((res) => {
      props.setDirection(`fixturesTransition${direction}`);
      res();
    });

    props.dispatch(setFilters({ date: props.selectorDate }));
  };

  return props.selectorDate ? (
    <li
      id={
        props.date !== "all"
          ? props.date.toDateString() === props.selectorDate.toDateString()
            ? "selectedDate"
            : null
          : null
      }
    >
      <span onClick={handleClick}>{formatDate(props.selectorDate)}</span>
    </li>
  ) : null;
};

export default DateCarousel;
