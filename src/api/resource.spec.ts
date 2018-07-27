import {MockApi} from './mock';
import {describeComponent} from '../tests/component';

describeComponent('reactive queries', [], () => {
    let mockApi: MockApi;
    let unsubscribeRequestedSpy: jasmine.Spy;

    beforeEach(() => {
        mockApi = new MockApi();
        unsubscribeRequestedSpy = jasmine.createSpy('unsubscribeRequestedSpy');
        mockApi.whenPost('/api/queryobserver/unsubscribe', unsubscribeRequestedSpy);

        mockApi.createResource('data');
        mockApi.simulateDelay(true);
    });

    it('should be disposable', (done) => {
        const subscriber1 = jasmine.createSpy('subscriber1');
        const subscriber2 = jasmine.createSpy('subscriber2');
        const subscriber3 = jasmine.createSpy('subscriber3');

        mockApi.Data.query({}, {reactive: true}).subscribe(subscriber1).dispose();
        mockApi.Data.query({}, {reactive: true}).subscribe(subscriber2).dispose();
        const subscription3 = mockApi.Data.query({}, {reactive: true}).subscribe(subscriber3);

        // Ensure these queries have been delayed.
        expect(subscriber1).not.toHaveBeenCalled();
        expect(subscriber2).not.toHaveBeenCalled();
        expect(subscriber3).not.toHaveBeenCalled();

        setTimeout(() => {
            expect(subscriber1).not.toHaveBeenCalled();
            expect(subscriber2).not.toHaveBeenCalled();
            expect(subscriber3).toHaveBeenCalledTimes(1);

            mockApi.addItem('data', {id: 1});
            expect(subscriber1).not.toHaveBeenCalled();
            expect(subscriber2).not.toHaveBeenCalled();
            expect(subscriber3).toHaveBeenCalledTimes(2);

            subscription3.dispose();

            mockApi.addItem('data', {id: 1});
            expect(subscriber3).toHaveBeenCalledTimes(2);

            done();
        }, 100);
    });

    describe('should make unsubscribe request', () => {
        it('after disposing the subscription', (done) => {
            const subscription1 = mockApi.Data.query({}, {reactive: true}).subscribe();

            setTimeout(() => {
                // QueryObserver is initialized.
                expect(unsubscribeRequestedSpy).not.toHaveBeenCalled();

                subscription1.dispose();
                expect(unsubscribeRequestedSpy).toHaveBeenCalled();

                done();
            }, 100);
        });
    });
});