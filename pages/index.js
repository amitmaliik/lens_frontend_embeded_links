import { useState, useEffect } from "react";
import {
  createClient,
  basicClient,
  searchPublications,
  explorePublications,
} from "../api";
import { css } from "@emotion/css";
import { trimString, generateRandomColor } from "../utils";
import { SearchButton, SearchInput, Placeholders } from "../components";
import Link from "next/link";
// import axios from "axios;";/

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [content, setNewContent] = useState([]);
  const [loadingState, setLoadingState] = useState("loading");
  const [searchString, setSearchString] = useState("");

  useEffect(() => {
    fetchPosts();
    fetch(`http://35.174.167.230/youtube`)
      .then((response) => response.json())
      .then((actualData) => setNewContent(actualData))
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  async function fetchPosts() {
    try {
      const response = await basicClient.query(explorePublications).toPromise();
      const posts = response.data.explorePublications.items.filter((post) => {
        if (post.profile) {
          post.backgroundColor = generateRandomColor();
          return post;
        }
      });
      setPosts(posts);
      setLoadingState("loaded");
    } catch (error) {
      console.log({ error });
    }
  }

  async function searchForPost() {
    setLoadingState("");
    try {
      const urqlClient = await createClient();
      const response = await urqlClient
        .query(searchPublications, {
          query: searchString,
          type: "PUBLICATION",
        })
        .toPromise();
      const postData = response.data.search.items.filter((post) => {
        if (post.profile) {
          post.backgroundColor = generateRandomColor();
          return post;
        }
      });

      setPosts(postData);
      if (!postData.length) {
        setLoadingState("no-results");
      }
    } catch (error) {
      console.log({ error });
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      searchForPost();
    }
  }

  console.log("UI Posts: ", posts);

  return (
    <div className={containerStyle}>
      <div className={searchContainerStyle}>
        <SearchInput
          placeholder="Search"
          onChange={(e) => setSearchString(e.target.value)}
          value={searchString}
          onKeyDown={handleKeyDown}
        />
        <SearchButton buttonText="SEARCH POSTS" onClick={searchForPost} />
      </div>
      <div className={listItemContainerStyle}>
        {loadingState === "no-results" && <h2>No results....</h2>}
        {loadingState === "loading" && <Placeholders number={6} />}
        {posts.map((post, index) => (
          <Link
            href={`/profile/${post.profile.id || post.profile.profileId}`}
            key={index}
          >
            <>
              <a>
                <div className={listItemStyle}>
                  <div className={profileContainerStyle}>
                    {post.profile.picture && post.profile.picture.original ? (
                      <img
                        src={post.profile.picture.original.url}
                        className={profileImageStyle}
                      />
                    ) : (
                      <div
                        className={css`
                          ${placeholderStyle};
                          background-color: ${post.backgroundColor};
                        `}
                      />
                    )}

                    <div className={profileInfoStyle}>
                      <h3 className={nameStyle}>{post.profile.name}</h3>
                      <p className={handleStyle}>{post.profile.handle}</p>
                      <p className={handleStyle}>{post.profile.handle}</p>
                    </div>
                  </div>
                  <div>
                    <p className={latestPostStyle}>
                      {trimString(post.metadata.content, 200)}
                    </p>
                  </div>
                </div>
              </a>
            </>
          </Link>
        ))}
      </div>
      {content.map((item, index) => {
        return item?.feed?.map((item) => (
          <div className={listItemStyle}>
            <p
              dangerouslySetInnerHTML={{
                __html: item,
              }}
            />
          </div>
        ));
      })}{" "}
    </div>
  );
}

const searchContainerStyle = css`
  padding: 40px 0px 30px;
`;

const latestPostStyle = css`
  margin: 23px 0px 5px;
  word-wrap: break-word;
`;

const profileContainerStyle = css`
  display: flex;
  flex-direction: row;
`;

const profileImageStyle = css`
  width: 42px;
  height: 42px;
  border-radius: 34px;
`;

const placeholderStyle = css`
  ${profileImageStyle};
`;

const containerStyle = css`
  width: 900px;
  margin: 0 auto;
  padding: 0px 0px 50px;
`;

const listItemContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

const listItemStyle = css`
  background-color: white;
  margin-top: 13px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 21px;
`;

const profileInfoStyle = css`
  margin-left: 10px;
`;

const nameStyle = css`
  margin: 0 0px 5px;
`;

const handleStyle = css`
  margin: 0px 0px 5px;
  color: #b900c9;
`;
