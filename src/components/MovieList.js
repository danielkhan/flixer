import styled from "styled-components";
import MovieRibbon from "@/components/MovieRibbon";
import { getGenresList } from "@/requests";
import { useState, useEffect } from "react";
import * as Sentry from '@sentry/browser';

function parseUserAgent(ua) {
  let browserName = ua.match(/(firefox|msie|trident|chrome|safari|edg|opera|opr)[\/\s]?(\d+(\.\d+)?)/i);
  let osName = ua.match(/(windows nt|macintosh|linux|ubuntu|android|ios|iphone os|ipad os)[\s\/]?(\d+(\.\d+)?)?/i);

  let browser = browserName ? `${browserName[1]} ${browserName[2]}` : "Unknown Browser";
  let os = osName ? `${osName[1]} ${osName[2] || ''}`.trim() : "Unknown OS";

  return { browser, os };
}
const DisplayList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px 30px 30px 30px;
`;

const RibbonList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 5px;
`;

const MovieList = ({ movieList, currentPage }) => {
  const [genres, setGenres] = useState({});

  useEffect(() => {
    const startTime = performance.now();
    getGenresList().then((result) => {
      setGenres(result);
      const loadDuration = endTime - startTime;
      const userAgentInfo = parseUserAgent(navigator.userAgent);
      Sentry.metrics.distribution('movie_list_loading_time', loadDuration, {
        unit: 'milliseconds',
        tags: {
          browser: userAgentInfo.browser,
          os: userAgentInfo.os,
        }
      });
    });
  }, []);

  return (
    <DisplayList>
      <RibbonList>
        {movieList.map(
          (
            {
              id,
              poster_path,
              title,
              vote_average,
              vote_count,
              genre_ids,
              release_date,
            },
            index
          ) => {
            return (
              <MovieRibbon
                key={id}
                id={id}
                rank={index + 1}
                currentPage={currentPage}
                url={"https://image.tmdb.org/t/p/w300" + poster_path}
                title={title}
                vote_average={vote_average}
                vote_count={vote_count}
                genre_ids={genre_ids}
                genres={genre_ids.map((id) => genres[id])}
                release_date={release_date}
              />
            );
          }
        )}
      </RibbonList>
    </DisplayList>
  );
};

export default MovieList;
