import styled from "styled-components";
import MovieGrid from "@/components/MovieGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getPopularMovies } from "@/requests";
import { useState, useEffect } from "react";
import { colors } from "@/constants";
import { useRouter } from "next/router";
import PageNavigationBar from "@/components/PageNavigationBar";
import * as Sentry from '@sentry/browser';

function parseUserAgent(ua) {
  let browserName = ua.match(/(firefox|msie|trident|chrome|safari|edg|opera|opr)[\/\s]?(\d+(\.\d+)?)/i);
  let osName = ua.match(/(windows nt|macintosh|linux|ubuntu|android|ios|iphone os|ipad os)[\s\/]?(\d+(\.\d+)?)?/i);

  let browser = browserName ? `${browserName[1]} ${browserName[2]}` : "Unknown Browser";
  let os = osName ? `${osName[1]} ${osName[2] || ''}`.trim() : "Unknown OS";

  return { browser, os };
}

const WelcomeHeader = styled.div`
  font-size: 4rem;
  font-weight: 800;
  display: flex;
  justify-content: center;
  padding: 5px;
  color: ${colors.theme1};
`;

const ButtonRibbon = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

export default function Home() {
  const [movieList, setMovieList] = useState([]);
  const router = useRouter();
  const pageNum = parseInt(router.query.pageNum);

  useEffect(() => {
    Sentry.metrics.increment('popular_movies_viewed', 1);

    // Start the timer
    const startTime = performance.now();

    getPopularMovies(pageNum).then((result) => {
      setMovieList(result);

      // End the timer and calculate the duration
      const endTime = performance.now();
      const loadDuration = endTime - startTime;
      const userAgentInfo = parseUserAgent(navigator.userAgent);

      Sentry.metrics.distribution('movie_grid_loading_time', loadDuration, {
        unit: 'milliseconds',
        tags: {
          browser: userAgentInfo.browser,
          os: userAgentInfo.os,
        }
      });      
      console.log(userAgentInfo);
    });
  }, [pageNum]);

  return (
    <>
      {movieList.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          <WelcomeHeader>{`Popular on TMDB`}</WelcomeHeader>
          <MovieGrid movieList={movieList} />
          <ButtonRibbon>
            <PageNavigationBar baseUrl={"/popular/"} currentPage={pageNum} />
          </ButtonRibbon>
        </>
      )}
    </>
  );
}
