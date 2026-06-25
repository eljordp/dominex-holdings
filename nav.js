(function(){
  var yr = document.getElementById('yr');
  if(yr) yr.textContent = new Date().getFullYear();
  var toggle = document.querySelector('.menu-toggle');
  if(toggle){
    toggle.addEventListener('click', function(){
      var links = document.querySelector('nav.links');
      var open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      if(!open){
        links.style.position='absolute';links.style.top='66px';links.style.left='0';
        links.style.right='0';links.style.flexDirection='column';links.style.background='var(--paper)';
        links.style.padding='24px 32px';links.style.borderBottom='1px solid var(--line)';links.style.gap='20px';
      }
    });
  }
})();
