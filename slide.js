window.onload= function() {
    var currentIndex = 0;
    var banner = $('.project-img')
    var bannerLength =  $('.project-img').find("img").length;
    function showImage(index) {
        $(".project-img1 img").fadeOut();
        $(".project-img1 img").eq(index).fadeIn();
    };
    timer();


    function timer() {
        setInterval(function(){
            currentIndex++; 
            if(currentIndex >= bannerLength){ currentIndex=0; };
            showImage(currentIndex);   
        },2500);
        
    };

}
