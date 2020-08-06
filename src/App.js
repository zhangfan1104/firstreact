import React from "react";
// import logo from "./logo.svg";
import "./App.css";

//设置 URL 常量和默认参数，来将 API 请求分解成几步
const DEFAULT_QUERY = "redux";

const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
//分页
const PARAM_PAGE = "page=";
//添加更多的可组合路径常量:设置抓取一定数量
const DEFAULT_HPP = "5";
//添加更多的可组合路径常量
const PARAM_HPP = "hitsPerPage=";

//在 JavaScript ES6 中，可以用模板字符串（template strings）去连接字符串。用它来拼接最终的 API 访问地址
const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}`;

console.log(url);

// const list = [
//   {
//     title: "React",
//     url: "https://facebook.github.io/react/",
//     author: "Jordan Walke",
//     num_comments: 3,
//     points: 4,
//     objectID: 0,
//   },
//   {
//     title: "Redux",
//     url: "https://github.com/reactjs/redux",
//     author: "Dan Abramov, Andrew Clark",
//     num_comments: 2,
//     points: 5,
//     objectID: 1,
//   },
//   {
//     title: "Redux",
//     url: "https://github.com/reactjs/redux",
//     author: "Dan Abramov, Andrew Clark",
//     num_comments: 3,
//     points: 6,
//     objectID: 2,
//   },
// ];

// function isSearched(searchTerm) {
//   return function(item) {
//     return item.title.toLowerCase().includes(searchTerm.toLowerCase());
//   }
// }

// const isSearched = (searchTerm) => (item) =>
//   item.title.toLowerCase().includes(searchTerm.toLowerCase());

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // list, //列表变量名和状态属性名称共享同一名称
      results: null,
      searchKey: "",
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);

    //数据获取
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);

    this.onSearchSubmit = this.onSearchSubmit.bind(this);

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this); //如果搜索的结果已经存在于缓存中，就阻止 API 请求。
  }

  //数据获取------------------------------------------------
  setSearchTopStories(result) {
    //取消分页新数据覆盖，合并起来
    const { hits, page } = result;
    // const oldHits = page !== 0 ? this.state.result.hits : [];

    //客户端缓存---------
    const { searchKey, results } = this.state;

    const oldHits =
      results && results[searchKey] ? results[searchKey].hits : [];
    //------------------

    const updatedHits = [...oldHits, ...hits];

    this.setState({
      // result: { hits: updatedHits, page },
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page },
      },
      isLoading: false, //加载
    });
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true }); //加载
    fetch(
      `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then((response) => response.json())
      .then((result) => this.setSearchTopStories(result))
      // .catch((e) => e);
      .catch((e) => this.setState({ error: e })); //捕获错误对象并将它存在本地状态中
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
    this.setState({ searchKey: searchTerm }); //客户端缓存
  }
  //---------------------------------------------------------

  onDismiss(id) {
    // function isNotId(item) {
    //   return item.objectID !== id;
    // }
    const { searchKey, results } = this.state; //客户端缓存
    const { hits, page } = results[searchKey]; //客户端缓存

    const isNotId = (item) => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page },
      },
    });
    // const updatedHits = this.state.result.hits.filter(isNotId);

    //const updatedList = this.state.list.filter((item) => item.objectID !== id);

    // this.setState({ list: updatedList });
    this.setState({
      result: Object.assign({}, this.state.result, { hits: updatedHits }),
    });
  }

  onSearchChange(e) {
    this.setState({ searchTerm: e.target.value });
  }

  onSearchSubmit(e) {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
    e.preventDefault(); //阻止类似于浏览器重新加载这样的浏览器原生行为
    this.setState({ searchKey: searchTerm }); //客户端缓存
    //如果搜索的结果已经存在于缓存中，就阻止 API 请求。
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
  }

  //如果搜索的结果已经存在于缓存中，就阻止 API 请求。
  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  render() {
    const helloWorld = true && "Welcome to the Road to learn React";
    const { searchTerm, results, searchKey, error, isLoading } = this.state;
    // if (!result) {
    //   return null;
    // }

    //错误渲染
    //  if (error) {
    //   return <p>Something went wrong.</p>;
    // }

    // const { searchTerm, list } = this.state;
    // const page = (result && result.page) || 0; //分页
    const page =
      (results && results[searchKey] && results[searchKey].page) || 0; //客户端缓存
    const list =
      (results && results[searchKey] && results[searchKey].hits) || []; //客户端缓存

    return (
      <div className="App">
        <header className="App-header">
          <h2>{helloWorld}</h2>
          <div className="page">
            <div className="interactions">
              <Search
                value={searchTerm}
                onChange={this.onSearchChange}
                onSubmit={this.onSearchSubmit}
              >
                Search
              </Search>
            </div>
            {/* 错误渲染----- */}
            {error ? (
              <div className="interactions">
                <p>Something went wrong.</p>
                {/* 加载+++++++ */}
                {isLoading ? (
                  <Loading />
                ) : (
                  <Button
                    onClick={() =>
                      this.fetchSearchTopStories(searchKey, page + 1)
                    }
                  >
                    More
                  </Button>
                )}
                {/* +++++++++++ */}
              </div>
            ) : (
              <Table list={list} onDismiss={this.onDismiss} />
            )}
            {/* ---------- */}

            {/* {result ? (
              <Table
                list={result.hits}
                pattern={searchTerm}
                onDismiss={this.onDismiss}
              />
            ) : null} */}
            {/* {result && (
              <Table
                list={result.hits}
                // pattern={searchTerm}
                onDismiss={this.onDismiss}
              />
            )} */}

            <Table list={list} onDismiss={this.onDismiss} />
            <div className="interactions">
              <Button
                // onClick={() => this.fetchSearchTopStories(searchTerm, page + 1)}
                onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
              >
                More
              </Button>
            </div>
          </div>
        </header>
      </div>
    );
  }
}

// const Search = ({ value, onChange, onSubmit, children }) => {
//   let input;
//   return (
//     <form onSubmit={onSubmit}>
//       <input
//         type="text"
//         value={value}
//         onChange={onChange}
//         //ES6 类组件的this对象可以帮助我们通过ref属性引用 DOM 节点。
//         ref={(node) => (input = node)}
//       />

//       <button type="submit">{children}</button>
//     </form>
//   );
// };
class Search extends React.Component {
  //以通过使用 this 对象、适当的生命周期方法和 DOM API 在组件挂载的时候来聚焦 input 字段
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }
  render() {
    const { value, onChange, onSubmit, children } = this.props;

    return (
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={value}
          onChange={onChange}
          //ES6 类组件的this对象可以帮助我们通过ref属性引用 DOM 节点。
          ref={(node) => {
            this.input = node;
          }}
        />
        <button type="submit">{children}</button>
      </form>
    );
  }
}

class Table extends React.Component {
  render() {
    // const { list, pattern, onDismiss } = this.props;
    const { list, onDismiss } = this.props;
    return (
      <div className="table">
        {/* {list.filter(isSearched(pattern)).map((item) => ( */}
        {list.map((item) => (
          <div key={item.objectID} className="table-row">
            <span tyle={{ width: "40%" }}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: "30%" }}>{item.author}</span>
            <span style={{ width: "10%" }}>{item.num_comments}</span>
            <span style={{ width: "10%" }}>{item.points}</span>
            <span style={{ width: "20%" }}>
              <Button
                // onClick={() => this.onDismiss(item.objectID)}        启动浏览器时执行
                //onClick={function () { console.log(item.objectID);}}  点击时执行
                // onClick={() => console.log(item.objectID)}           转换成箭头函数
                onClick={() => onDismiss(item.objectID)}
                className="button-inline"
              >
                Dismiss
              </Button>
            </span>
          </div>
        ))}
      </div>
    );
  }
}

class Button extends React.Component {
  render() {
    const { onClick, className = "", children } = this.props;

    return (
      <button onClick={onClick} className={className} type="button">
        {children}
      </button>
    );
  }
}

const Loading = () => <div>Loading ...</div>;

export default App;

export { Button, Search, Table };
