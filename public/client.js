$(document).ready(function(){
    const getChart = (tf)=>{
        $.get("/data/" + tf,function(data, status){
            console.log(data)
            if(tf == "1d"){
                $("#header-text").text("24h price");
                $("#1d").addClass("btn-down")
                $("#7d").removeClass("btn-down")
            }else if(tf == "7d"){
                $("#header-text").text("7 days price");
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
            var yUsdtValues = data.filter((obj)=>{
                return /usdt/i.test(obj.currency);
            }).map((obj)=>{return obj.price});

            var yUsdValues = data.filter((obj)=>{
                return /usd/i.test(obj.currency);
            }).map((obj)=>{return obj.price});

            var yMlcValues = data.filter((obj)=>{
                return /mlc/i.test(obj.currency);
            }).map((obj)=>{return obj.price});

            new Chart("usdtChart", {
                type: "line",
                data: {
                    labels: xValues,
                    datasets: [{
                    fill: false,
                    backgroundColor: "rgba(71,141,182,1)",
                    borderColor: "rgba(71,141,182,1)",
                    data: yUsdtValues
                    }]
                },
                options: {
                    legend: {display: false}
                }
            });

            new Chart("usdChart", {
                type: "line",
                data: {
                    labels: xValues,
                    datasets: [{
                    fill: false,
                    backgroundColor: "rgba(71,141,182,1)",
                    borderColor: "rgba(71,141,182,1)",
                    data: yUsdValues
                    }]
                },
                options: {
                    legend: {display: false}
                }
            });

            new Chart("mlcChart", {
                type: "line",
                data: {
                    labels: xValues,
                    datasets: [{
                    fill: false,
                    backgroundColor: "rgba(71,141,182,1)",
                    borderColor: "rgba(71,141,182,1)",
                    data: yMlcValues
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