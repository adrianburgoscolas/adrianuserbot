$(document).ready(function(){
    const getChart = (tf)=>{
        $.get("/data/" + tf,function(data, status){
            if(tf == "1d"){
                $("#header-text").text("24h usdt price");
                $("#1d").addClass("btn-down")
                $("#7d").removeClass("btn-down")
            }else if(tf == "7d"){
                $("#header-text").text("7 days usdt price");
                $("#7d").addClass("btn-down")
                $("#1d").removeClass("btn-down")
            }
            var xValues = data.map((obj)=>{
                if(tf == "1d"){
                    let time = new Date(obj.date).toLocaleTimeString().split(":")
                    return `${time[0]}:${time[1]}`
                }else if(tf == "7d"){
                    let date = new Date(obj.date).toLocaleDateString().split("/")
                    let time = new Date(obj.date).toLocaleTimeString().split(":")
                    return `${time[0]}:${time[1]} ${date[0]}/${date[1]}`
                }
            });
            var yValues = data.map((obj)=>{
                return obj.price
            });

            new Chart("myChart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [{
                fill: false,
                backgroundColor: "rgba(71,141,182,1)",
                borderColor: "rgba(71,141,182,1)",
                data: yValues
                }]
            },
            options: {
                legend: {display: false}
            }
            });
        });
   };

    $("#form").hide();
    let socket = io();
    socket.on("askcode",(data)=>{
        $("#form").show();
        $("main").append(`<p>${data}</p>`)
    });
    $("#form").submit(function(e){
        e.preventDefault();
        const code = $("#input").val();
        socket.emit("code",code);
        $("#input").val("");
    });

   getChart("1d");

   $("#1d").click(()=>{
       getChart("1d")
   });

   $("#7d").click(()=>{
       getChart("7d")
   });

});