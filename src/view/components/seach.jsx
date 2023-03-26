import { SearchBar, Button } from 'antd-mobile';
import { SearchOutline } from 'antd-mobile-icons'
import './seach.css';

export default function Search(props) {
  const { setSearchText, refreshGoods } = props;


  return (
    <div className='search-bar'>
      <div className='search-bar-left'>
        <SearchBar onChange={setSearchText} />
      </div>
      <div className='search-bar-right'>
        <Button size='small' color='primary' onClick={refreshGoods}>
          <SearchOutline />搜索
        </Button>
      </div>
    </div>
  );
}