// screen saver
var ScreenSaver = (function() {
    // constructor
    function ScreenSaver() {
        // ball position.
        this.pos_x = 0;
        this.pos_y = 0;

        // move param.
        this.move_angle_radian = 315 * Math.PI / 180;
        var step_values = this.calcMoveStepValue(this.move_angle_radian);
        this.step_x = step_values[0];
        this.step_y = step_values[1];

        // timer property.
        this.intervalId;
        this.timeoutId;

        // event to monitor.
        this.monitor_event_list = ['mousedown', 'mouseup', 'mousemove', 'onkeydown', 'onkeyup'];
        this.listen_event_info = [];

        this.drawBall();
    }

    // public method.
    ScreenSaver.prototype.Attach = function(timeout_msec) {
        this.setScreenSaver(timeout_msec);

        // register events to monitor.
        for (var i = 0; i < this.monitor_event_list.length; i++) {
            console.log(this.monitor_event_list[i]);
            var callback = () => {this.setScreenSaver(timeout_msec);};
            document.addEventListener(this.monitor_event_list[i], callback, false);
            var event_info = {
                target: document,
                type: this.monitor_event_list[i],
                listener: callback,
                capture: false
            };
            this.listen_event_info.push(event_info);
        }
    }

    ScreenSaver.prototype.Detach = function() {
        // clear timer.
        clearInterval(this.intervalId);
        clearTimeout(this.timeoutId);

        // remove event.
        for (var i = 0; i < this.listen_event_info.length; i++) {
            var e = this.listen_event_info[i];
            // document.removeEventListener(this.listen_event_info[i]);
            e.target.removeEventListener(e.type, e.listener, e.capture);
        }

        // remove ball.
        this.moveStop();
    }

    // private method.
    ScreenSaver.prototype.setScreenSaver = function(timeout_msec) {
        // clear timer.
        clearInterval(this.intervalId);
        clearTimeout(this.timeoutId);

        // reset ball.
        this.moveStop();

        // set timer.
        this.timeoutId = setTimeout(() => { this.moveStart() }, timeout_msec);
    }

    ScreenSaver.prototype.drawBall = function() {
        var ball_line_width = 8;
        var radius = 100;

        // canvas init.
        this.ball = document.createElement("canvas");
        this.ball.setAttribute("width", String((radius * 2) + (ball_line_width * 2)));
        this.ball.setAttribute("height", String((radius * 2) + (ball_line_width * 2)));
        this.ball.style.position = 'absolute';
        this.ball.style.top = String(this.pos_y) + 'px';
        this.ball.style.left = String(this.pos_x) + 'px';
        
        // clear.
        var context = this.ball.getContext("2d");
        context.clearRect(0, 0, this.ball.width, this.ball.height);

        // draw.
        context.arc(radius + ball_line_width, radius + ball_line_width, radius, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        context.fillStyle = "rgba(255, 0, 0, 0.8)";
        context.fill();
        context.strokeStyle = "rgba(255, 0, 0, 1.0)";
        context.lineWidth = ball_line_width;
        context.stroke();
    }

    ScreenSaver.prototype.moveStart = function() {
        // append ball.
        document.body.appendChild(this.ball);

        // ball move start.
        var interval_msec = 10;
        this.intervalId = setInterval(() => { this.positionUpdate(); }, interval_msec);
    }

    ScreenSaver.prototype.moveStop = function() {
        if (this.ball == null) {
            return;
        }

        // remove ball.
        var parent = this.ball.parentNode;
        if (parent == null) {
            return;
        }
        this.ball = parent.removeChild(this.ball);
    }

    ScreenSaver.prototype.positionUpdate = function(){
        // move ball.
        this.move(this.step_x, this.step_y);

        if (this.isBound() == true){
            // update step values.
            this.move_angle_radian = this.bound(this.move_angle_radian);
            var step_values = this.calcMoveStepValue(this.move_angle_radian);
            this.step_x = step_values[0];
            this.step_y = step_values[1];
        }
    }

    ScreenSaver.prototype.move = function(step_x, step_y) {
        // get are.
        var screen_width = window.innerWidth;
        var screen_height = window.innerHeight;
        // calc next postion.
        var next_x = this.pos_x + step_x;
        var next_y = this.pos_y + step_y;

        // out area.
        if (next_x <= 0) {
            next_x = 0;
        }
        if (next_x + this.ball.width >= screen_width) {
            next_x = screen_width - this.ball.width;
        }
        if (next_y <= 0) {
            next_y = 0;
        }
        if (next_y + this.ball.height >= screen_height) {
            next_y = screen_height - this.ball.height;
        }

        // position update.
        this.pos_x = next_x;
        this.pos_y = next_y;
        this.ball.style.top = String(this.pos_y) + 'px';
        this.ball.style.left = String(this.pos_x) + 'px';
    }

    ScreenSaver.prototype.calcMoveStepValue = function(angle_value) {
        var speed = 3.0;
        // var step_x = Math.ceil(speed * Math.cos(angle_value));
        // var step_y = Math.ceil(speed * Math.sin(angle_value));
        var step_x = speed * Math.cos(angle_value);
        var step_y = speed * Math.sin(angle_value);

        return [step_x, step_y]
    }

    ScreenSaver.prototype.isBound = function(){
        // get area.
        var screen_width = window.innerWidth;
        var screen_height = window.innerHeight;

        // out area.
        if (this.pos_x <= 0) {
            return true;
        }
        if (this.pos_x + this.ball.width >= screen_width) {
            return true;
        }
        if (this.pos_y <= 0) {
            return true;
        }
        if (this.pos_y + this.ball.height >= screen_height) {
            return true;
        }

        // in area.
        return false;
    }

    ScreenSaver.prototype.bound = function(angle_value) {
        // get area.
        var screen_width = window.innerWidth;
        var screen_height = window.innerHeight;
        // now move step value.
        var step_values = this.calcMoveStepValue(angle_value);
        var step_x = step_values[0];
        var step_y = step_values[1];

        // out area.
        if ((this.pos_x <= 0) || (this.pos_x + this.ball.width >= screen_width)) {
            // out horizontal.
            step_x = step_x * -1;
        }
        if ((this.pos_y <= 0) || (this.pos_y + this.ball.height >= screen_height)) {
            // out vertical.
            step_y = step_y * -1;
        }
        return Math.atan2(step_y, step_x);
    }

    return ScreenSaver;
})();