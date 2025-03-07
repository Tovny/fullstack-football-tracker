import "./DateCarousel.scss";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaChevronLeft, FaChevronRight, FaRegCalendar } from "react-icons/fa";
import { CSSTransition } from "react-transition-group";
import { useSelector, useDispatch } from "react-redux";
import { setFilters } from "../redux/actions/filter-actions";
import { enGB } from "date-fns/locale";
import { format, isToday, isTomorrow, isYesterday, isSameDay } from "date-fns";
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

const DateCarousel = () => {
  const dispatch = useDispatch();
  const { date } = useSelector((state) => state.filters);
  const [carouselDate, setCarouselDate] = useState(
    date === "all" ? new Date() : new Date(date)
  );
  const dateSliderRef = useRef(null);
  const selectedDateRef = useRef(null);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectorDates, setSelectorDates] = useState([]);
  const [changeScrollX, setChangeScrollX] = useState(false);
  const [currentSelectedI, setCurrentSelectedI] = useState(0);
  const sliderULref = useRef(null);
  const selectedDate = document.getElementById("selectedDate");

  useEffect(() => {
    if (date === "all") {
      if (selectedDateRef.current) {
        selectedDateRef.current.removeAttribute("id");
      }
    } else if (isToday(date) && !selectorDates.includes(date))
      setCarouselDate(new Date(date));

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    document
      .getElementsByClassName("fixtures")[0]
      .classList.add(`fixturesTransition${direction}`);

    dispatch(setFilters({ date: calendarDate }));
    setCarouselDate(calendarDate);

    setOpenCalendar(false);
  };

  useEffect(() => {
    if (date !== "all")
      selectorDates.forEach((selectorDate, i) => {
        if (selectorDate.toDateString() === date.toDateString()) {
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

        childSpan.addEventListener("click", () => {
          if (isToday(date)) {
            setOpenCalendar(false);
          } else {
            handleCalendarChange(new Date());
          }
        });

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
      dateSliderRef.current.style.scrollBehavior = "auto";
      scrollXto = scrollXto + dateSliderRef.current.scrollLeft;

      setChangeScrollX(false);
      dateSliderRef.current.scrollLeft = scrollXto;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectorDates]);

  useEffect(() => {
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (selectedDateRef.current) {
        let scrollXto = 0;
        if (sliderULref.current) {
          dateSliderRef.current.style.scrollBehavior = "smooth";
          for (let i = 0; i < sliderULref.current.children.length; i++) {
            if (sliderULref.current.children[i] === selectedDateRef.current) {
              scrollXto =
                scrollXto +
                selectedDateRef.current.getBoundingClientRect().width / 2;
              break;
            } else if (sliderULref.current.children[i]) {
              scrollXto =
                scrollXto +
                sliderULref.current.children[i].getBoundingClientRect().width;
            }
          }
        }

        scrollXto =
          scrollXto -
          document
            .getElementsByClassName("dateCarousel")[0]
            .getBoundingClientRect().width /
            2;

        dateSliderRef.current.scrollLeft = scrollXto;
      }
    })();
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

  useEffect(() => {
    const closeCalendar = () => setOpenCalendar(false);

    if (openCalendar && window.innerWidth <= 992) {
      document.getElementsByTagName("html")[0].scrollTop = 0;
      document.getElementsByTagName("html")[0].className = "noScroll";
      document.getElementsByTagName("body")[0].className = "noScroll";
    } else {
      document.getElementsByTagName("html")[0].classList.remove("noScroll");
      document.getElementsByTagName("body")[0].classList.remove("noScroll");
    }

    if (openCalendar && window.innerWidth > 992) {
      document.body.addEventListener("click", closeCalendar);
    }

    return () => {
      document.body.removeEventListener("click", closeCalendar);
    };
  }, [openCalendar]);

  return (
    <div className="datePickerContainer">
      <FaChevronLeft
        className="sliderButton"
        id="sliderLeft"
        onClick={() => handleScroll(-300)}
      />
      <div ref={dateSliderRef} className="dateCarousel">
        <ul ref={sliderULref}>
          {selectorDates
            ? selectorDates.map((selectorDate, i) => {
                return (
                  <DateSelector
                    date={date}
                    selectorDate={selectorDate}
                    dispatch={dispatch}
                    setOpenCalendar={setOpenCalendar}
                    key={i}
                    selectedDateRef={selectedDateRef}
                  />
                );
              })
            : null}
        </ul>
      </div>
      <FaChevronRight
        className="sliderButton"
        id="sliderRight"
        onClick={() => handleScroll(300)}
      />
      <FaRegCalendar
        id="calendarIcon"
        onClick={(event) => {
          setOpenCalendar(!openCalendar);
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
        }}
      />
      {document.getElementsByClassName("filters")[0]
        ? createPortal(
            <FaRegCalendar
              id="calendarIcon"
              onClick={(event) => {
                setOpenCalendar(!openCalendar);
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
              }}
            />,
            document.getElementsByClassName("filters")[0]
          )
        : null}
      {createPortal(
        <CSSTransition
          in={openCalendar && window.innerWidth <= 992}
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
        </CSSTransition>,
        document.getElementById("root")
      )}
      <CSSTransition
        in={openCalendar && window.innerWidth > 992}
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
  const handleClick = async () => {
    if (props.date !== "all") {
      if (!isSameDay(props.selectorDate, props.date)) {
        let direction;
        if (props.selectorDate > props.date) {
          direction = "Right";
        } else {
          direction = "Left";
        }

        document
          .getElementsByClassName("fixtures")[0]
          .classList.add(`fixturesTransition${direction}`);

        props.setOpenCalendar(false);
        props.dispatch(setFilters({ date: props.selectorDate }));
      }
    } else {
      props.setOpenCalendar(false);
      props.dispatch(setFilters({ date: props.selectorDate }));
    }
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
