import "./DateCarousel.scss";
import { useState, useEffect, useRef } from "react";
import ArrowBack from "@material-ui/icons/ArrowBackIosOutlined";
import ArrowForward from "@material-ui/icons/ArrowForwardIosOutlined";
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
  const selectedDateRef = useRef(null);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectorDates, setSelectorDates] = useState();
  const [changeScrollX, setChangeScrollX] = useState(false);
  const [currentSelectedI, setCurrentSelectedI] = useState(0);
  const sliderULref = useRef(null);
  const selectedDate = document.getElementById("selectedDate");

  useEffect(() => {
    if (date === "all") {
      if (selectedDateRef.current) {
        selectedDateRef.current.removeAttribute("id");
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

  const handleCalendarChange = (calendarDate) => {
    let direction;
    if (calendarDate > date) {
      direction = "Right";
    } else {
      direction = "Left";
    }

    props.setDirection(`fixturesTransition${direction}`);

    dispatch(setFilters({ date: calendarDate }));
    setCarouselDate(calendarDate);
    setOpenCalendar(false);
  };

  useEffect(() => {
    if (selectorDates)
      selectorDates.forEach((selectorDate, i) => {
        if (selectorDate === date) {
          setCurrentSelectedI(i);
          if (selectorDates.length - i <= 3) {
            const newSelectors = [];
            for (let j = 7 - (selectorDates.length - i - 1); j >= 1; j--) {
              const newDateSelector = new Date(
                selectorDates[selectorDates.length - 1]
              );
              newDateSelector.setDate(newDateSelector.getDate() + j);
              newSelectors.unshift(newDateSelector);
            }
            setSelectorDates([...selectorDates, ...newSelectors]);
          } else if (i < 3) {
            const newSelectors = [];
            for (let j = 7 - i; j >= 1; j--) {
              const newDateSelector = new Date(selectorDates[0]);
              newDateSelector.setDate(newDateSelector.getDate() - j);
              newSelectors.push(newDateSelector);
            }
            setSelectorDates([...newSelectors, ...selectorDates]);

            if (selectedDateRef.current) setChangeScrollX(true);
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

  useEffect(() => {
    if (changeScrollX) {
      let scrollXto = 0;
      for (let i = 0; i < 7 - currentSelectedI; i++) {
        if (sliderULref.current) {
          if (sliderULref.current.children[i]) {
            scrollXto =
              scrollXto +
              sliderULref.current.children[i].getBoundingClientRect().width;
          }
        }
      }

      scrollXto = scrollXto + dateSliderRef.current.scrollLeft;

      setChangeScrollX(false);
      dateSliderRef.current.scrollLeft = scrollXto;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectorDates]);

  useEffect(() => {
    if (selectedDateRef.current)
      selectedDateRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
  }, [selectedDate]);

  const handleScroll = (direction) => {
    const slider = dateSliderRef.current;
    if (slider) {
      const scrollAmount = slider.scrollLeft + direction;

      dateSliderRef.current.scrollTo({
        top: 0,
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="datePickerContainer">
      <div
        className="sliderButton"
        id="sliderLeft"
        onClick={() => handleScroll(-300)}
      >
        <ArrowBack style={{ color: "rgb(170, 161, 30)" }} />
      </div>
      <div ref={dateSliderRef} className="dateCarousel">
        <ul ref={sliderULref}>
          {selectorDates
            ? selectorDates.map((selectorDate, i) => {
                return (
                  <DateSelector
                    date={date}
                    selectorDate={selectorDate}
                    dispatch={dispatch}
                    setDirection={props.setDirection}
                    key={i}
                    selectedDateRef={selectedDateRef}
                  />
                );
              })
            : null}
        </ul>
      </div>
      <div
        className="sliderButton"
        id="sliderRight"
        onClick={() => handleScroll(300)}
      >
        <ArrowForward style={{ color: "rgb(170, 161, 30)" }} />
      </div>
      <CalendarTodaySharpIcon
        id="calendarIcon"
        onClick={() => {
          setOpenCalendar(!openCalendar);
        }}
        style={{ transition: "all .2s", color: "rgb(170, 161, 30)" }}
      />
      <CSSTransition
        in={openCalendar}
        timeout={200}
        mountOnEnter
        unmountOnExit
        classNames="calendarModal"
        onClick={() => setOpenCalendar(false)}
      >
        <div className="calendarModal">
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
  const handleClick = () => {
    let direction;
    if (props.selectorDate > props.date) {
      direction = "Right";
    } else {
      direction = "Left";
    }

    props.setDirection(`fixturesTransition${direction}`);

    props.dispatch(setFilters({ date: props.selectorDate }));
  };

  return props.selectorDate ? (
    <li
      ref={
        props.date !== "all"
          ? props.date.toDateString() === props.selectorDate.toDateString()
            ? props.selectedDateRef
            : null
          : null
      }
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
