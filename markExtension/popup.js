//this is the pagination button PaginationButton-c11n-8-102-0__sc-1i6hxyy-0
//aria-disabled="true" when the button is active.
document.getElementById('pickText').addEventListener('click', () => {
    // Send a message to the content script to pick the text
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: pickTextByClass,
        args: []
      }, (results) => {
        document.getElementById('result').textContent = results[0].result;
        if (results && results[0] && results[0].result) {
          const data = results[0].result;
          downloadCSV(data);
        } else {
         document.getElementById('result').textContent = 'No text found';
        }
      });
    });
  });
  
  function pickTextByClass(className) {
    function getAddress(currEle){
        if(currEle.children && currEle.children.length && currEle.children[0].children.length){
            temp = currEle.children[0].children[0];
            temp = temp.getElementsByTagName('article');
            if(!temp.length) return false;
            temp = temp[0];
            if(!(temp.children && temp.children.length && temp.children[0].children)) return false;
            let arr = temp.children[0].children;
            if(!arr.length) return false;
            let first = arr[0];
            //let second = arr[1];
            if(!(first.children)) return false;
            let fourDivs = first.children;
            if(!fourDivs.length) return false;
            let addr = fourDivs[0].getElementsByTagName('address');
            if(!(addr.length && addr[0].innerHTML)) return false;
            addr = addr[0].innerHTML;
            return addr.split(',').join(' ').replace(/#/g, '');
        }else{
            return false;
        }
    }

    function getSoldDate(currEle){
        if(currEle.children && currEle.children.length && currEle.children[0].children.length){
            temp = currEle.children[0].children[0];
            temp = temp.getElementsByTagName('article');
            if(!temp.length) return false;
            temp = temp[0];
            if(!(temp.children && temp.children.length && temp.children[0].children)) return false;
            let arr = temp.children[0].children;
            if(!(arr.length >= 2) ) return false;
            //let first = arr[0];
            let second = arr[1];
            if(!(second && second.children && second.children.length && second.children[0].children && second.children[0].children.length)) return false;
            if(!(second.children[0].children[0].children && second.children[0].children[0].children.length)) return false;
            let sold = second.children[0].children[0].children[0];
            let soldOn = sold.innerHTML;
            return soldOn.split(',').join('');
        }else{
            return false;
        }
    }

    function getPrice(currEle){
        if(currEle.children && currEle.children.length && currEle.children[0].children.length){
            temp = currEle.children[0].children[0];
            temp = temp.getElementsByTagName('article');
            if(!temp.length) return false;
            temp = temp[0];
            if(!(temp.children && temp.children.length && temp.children[0].children)) return false;
            let arr = temp.children[0].children;
            if(!arr.length) return false;
            let first = arr[0];
            if(!(first.children)) return false;
            let fourDivs = first.children;
            if(!(fourDivs.length >= 3)) return false;
            let price = fourDivs[2].getElementsByTagName('span');
            if(!price.length) return false;
            price= price[0];
            return price.innerHTML.split(',').join('');
        }else{
            return false;
        }
    }

    
    className='ListItem-c11n-8-102-0__sc-13rwu5a-0'
    let elements = document.getElementsByClassName(className);
    res = []
    for (let i =0;i<elements.length;i++){
        let currRes = {}
        let currEle = elements[i];
        if(currEle.hasAttribute('data-test')){
            continue;
        }
        currRes.address = getAddress(currEle);
        if (currRes.address == false){
            currRes.address = 'not given'
        };
        currRes.soldOn = getSoldDate(currEle);
        if (currRes.soldOn == false){
            currRes.soldOn = 'not given'
        }; 
        currRes.price = getPrice(currEle);
        if(currRes.price == false){
            currRes.price = 'not given'
        };
        res.push(currRes);
    }
    
    if(res.length > 0 && res[0].address && res[0].price && res[0].soldOn ){
        let cnt = []
        for(let i=0;i<res.length;i++){
            temp = []
            temp.push(res[i].address);
            temp.push(res[i].soldOn);
            temp.push(res[i].price);
            cnt.push(temp)
        }
        return { headers: ['address','sold on','price'], content: cnt};
    }else{
        return { headers: ['address','sold on','price'], content: [] };
    }
  }
  
  // Function to convert the data object to CSV format and download it
  function downloadCSV(data) {
    const { headers, content } = data;
    const csvContent = [
      headers.join(","),
      ...content.map(row => row.join(","))
    ].join("\n");
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "text_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  