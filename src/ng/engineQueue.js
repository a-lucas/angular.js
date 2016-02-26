/**
 * Created by antoine on 18/02/16.
 */
'use strict';

/**
 * @ngdoc service
 * @name $engineQueue
 * @requires
 *
 * @description
 * A Queue that stores the running status of the Angular APplication
 * An Empty queue means the application is in 'idle'.
 * It is used internally
 *
 */
function $EngineQueueProvider() {
    this.$get = ['$window', function($window) {

        /**
         *
         * @type {Array} string url waiting to be processed
         */
        var httpBackend= [];
        /**
         *
         * @type {number} Nummber of running system timeout
         */
        var timeouts= 0;
        /**
         *
         * @type {number} number of running promises
         */
        var promises= 0;
        /**
         *
         * @type {boolean}
         */
        var done= false;
        /**
         *
         * @type {number} idle bufer time in ms
         */
        var timeoutValue= 500;
        /**
         *
         * @type {TimeOut} the timeout that runs only when all the queues are empty with the idle check timeoutValue
         */
        var timeout= null;

        /**
         *
         * @param object Add an object:
         * @param type string httpBackend|promise|timeout
         */
        function add(object, type) {
                if (timeout !== null) {
                    clearTimeout(timeout);
                }
                if (done === true) return;

                switch (type) {
                    case 'httpBackend':
                        httpBackend[object.id] =
                        {
                            id: object.id,
                            when: Date.now()
                        };
                        break;
                    case 'timeout':
                        timeouts++;
                        break;
                    case 'promise':
                        promises++;
                        break;
                }
        }

        /**
         *
         * @param object
         * @param string httpBackend|promise|timeout
         */
        function resolve(object, type) {
                if (done === true) return;
                switch (type) {
                    case 'httpBackend':
                        delete httpBackend[object.id];
                        break;
                    case 'timeout':
                        timeouts--;
                        break;
                    case 'promise':
                        promises--;
                        break;
                }


                if (timeout !== null) {
                    clearTimeout(timeout);
                }

                if (httpBackend.length === 0 && timeouts === 0 && promises === 0) {

                    timeout = setTimeout(function() {
                        if (httpBackend.length === 0 && timeouts === 0 && promises === 0) {
                            var StackQueueEmpty = new Event('StackQueueEmpty');
                            if (typeof $window.dispatchEvent === 'function') {
                                $window.dispatchEvent(StackQueueEmpty);
                            }
                            done = true;
                        }
                    }, timeoutValue);
                }
        }

        return {
            add: add,
            resolve: resolve
        };

    }];
}
